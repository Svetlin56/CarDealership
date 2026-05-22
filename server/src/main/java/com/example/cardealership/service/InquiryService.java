package com.example.cardealership.service;

import com.example.cardealership.domain.Inquiry;
import com.example.cardealership.domain.InquiryMessage;
import com.example.cardealership.domain.InquiryMessageSender;
import com.example.cardealership.domain.Listing;
import com.example.cardealership.dto.InquiryDtos;
import com.example.cardealership.repository.InquiryMessageRepository;
import com.example.cardealership.repository.InquiryRepository;
import com.example.cardealership.repository.ListingRepository;
import com.example.cardealership.web.error.BusinessValidationException;
import com.example.cardealership.web.error.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class InquiryService {

    private static final String INQUIRY_EMAIL_SUBJECT = "New inquiry for your listing";

    private final InquiryRepository inquiryRepo;
    private final InquiryMessageRepository messageRepo;
    private final ListingRepository listingRepo;
    private final EmailService emailService;

    @Transactional
    public InquiryDtos.InquiryResponse create(Long listingId, InquiryDtos.InquiryRequest req) {
        Listing listing = listingRepo.findByIdAndStatus(listingId, Listing.Status.ACTIVE)
                .orElseThrow(() -> new ResourceNotFoundException("Listing", "id", listingId));

        if (listing.getCar().isDeleted()) {
            throw new BusinessValidationException("Cannot send inquiry for a deleted car.");
        }

        Inquiry inquiry = Inquiry.builder()
                .listing(listing)
                .name(normalizeRequired(req.getName()))
                .email(normalizeEmail(req.getEmail()))
                .phone(normalizeRequired(req.getPhone()))
                .message(normalizeOptional(req.getMessage()))
                .build();

        Inquiry saved = inquiryRepo.save(inquiry);

        if (saved.getMessage() != null && !saved.getMessage().isBlank()) {
            messageRepo.save(InquiryMessage.builder()
                    .inquiry(saved)
                    .senderType(InquiryMessageSender.USER)
                    .message(saved.getMessage())
                    .readByUser(true)
                    .readByAdmin(false)
                    .build());
        }

        sendInquiryNotificationSafely(listing, saved);

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<InquiryDtos.AdminInquiryResponse> findAllForAdmin() {
        return inquiryRepo.findAllBy(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<InquiryDtos.UserInquiryResponse> findForCurrentUser(String email) {
        return inquiryRepo.findByEmailIgnoreCaseOrderByCreatedAtDesc(normalizeEmail(email))
                .stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InquiryDtos.UnreadInquiryRepliesResponse countUnreadRepliesForCurrentUser(String email) {
        long count = messageRepo.countByInquiry_EmailIgnoreCaseAndSenderTypeAndReadByUserFalse(
                normalizeEmail(email),
                InquiryMessageSender.ADMIN
        );

        return new InquiryDtos.UnreadInquiryRepliesResponse(count);
    }

    @Transactional(readOnly = true)
    public InquiryDtos.UnreadInquiryRepliesResponse countUnreadUserMessagesForAdmin() {
        long count = messageRepo.countBySenderTypeAndReadByAdminFalse(InquiryMessageSender.USER);

        return new InquiryDtos.UnreadInquiryRepliesResponse(count);
    }

    @Transactional(readOnly = true)
    public List<InquiryDtos.InquiryMessageResponse> findMessages(Long inquiryId, Authentication authentication) {
        Inquiry inquiry = findInquiryOrThrow(inquiryId);
        validateAccessToInquiry(inquiry, authentication);

        return messageRepo.findByInquiryIdOrderByCreatedAtAsc(inquiryId)
                .stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public InquiryDtos.InquiryMessageResponse sendMessage(
            Long inquiryId,
            InquiryDtos.InquiryMessageRequest req,
            Authentication authentication
    ) {
        Inquiry inquiry = findInquiryOrThrow(inquiryId);
        validateAccessToInquiry(inquiry, authentication);

        boolean admin = isAdmin(authentication);
        String message = normalizeRequired(req.getMessage());

        InquiryMessage savedMessage = messageRepo.save(InquiryMessage.builder()
                .inquiry(inquiry)
                .senderType(admin ? InquiryMessageSender.ADMIN : InquiryMessageSender.USER)
                .message(message)
                .readByUser(!admin)
                .readByAdmin(admin)
                .build());

        if (admin) {
            inquiry.setAdminReplyMessage(message);
            inquiry.setAdminRepliedAt(savedMessage.getCreatedAt());
            inquiry.setAdminReplyReadByUser(false);
            inquiryRepo.save(inquiry);
        }

        return toMessageResponse(savedMessage);
    }

    @Transactional
    public InquiryDtos.AdminInquiryResponse replyForAdmin(Long id, InquiryDtos.AdminReplyRequest req) {
        Inquiry inquiry = findInquiryOrThrow(id);

        InquiryMessage savedMessage = messageRepo.save(InquiryMessage.builder()
                .inquiry(inquiry)
                .senderType(InquiryMessageSender.ADMIN)
                .message(normalizeRequired(req.getMessage()))
                .readByUser(false)
                .readByAdmin(true)
                .build());

        inquiry.setAdminReplyMessage(savedMessage.getMessage());
        inquiry.setAdminRepliedAt(savedMessage.getCreatedAt());
        inquiry.setAdminReplyReadByUser(false);

        Inquiry savedInquiry = inquiryRepo.save(inquiry);

        return toAdminResponse(savedInquiry);
    }

    @Transactional
    public void markMessagesAsRead(Long inquiryId, Authentication authentication) {
        Inquiry inquiry = findInquiryOrThrow(inquiryId);
        validateAccessToInquiry(inquiry, authentication);

        if (isAdmin(authentication)) {
            List<InquiryMessage> unreadUserMessages = messageRepo.findByInquiryIdAndSenderTypeAndReadByAdminFalse(
                    inquiryId,
                    InquiryMessageSender.USER
            );

            unreadUserMessages.forEach(message -> message.setReadByAdmin(true));
            messageRepo.saveAll(unreadUserMessages);
            return;
        }

        List<InquiryMessage> unreadAdminMessages = messageRepo.findByInquiryIdAndSenderTypeAndReadByUserFalse(
                inquiryId,
                InquiryMessageSender.ADMIN
        );

        unreadAdminMessages.forEach(message -> message.setReadByUser(true));
        messageRepo.saveAll(unreadAdminMessages);

        if (!unreadAdminMessages.isEmpty()) {
            inquiry.setAdminReplyReadByUser(true);
            inquiryRepo.save(inquiry);
        }
    }

    @Transactional
    public InquiryDtos.UserInquiryResponse markReplyAsReadForCurrentUser(Long id, String email) {
        Inquiry inquiry = findInquiryOrThrow(id);
        validateUserOwnsInquiry(inquiry, email);

        List<InquiryMessage> unreadAdminMessages = messageRepo.findByInquiryIdAndSenderTypeAndReadByUserFalse(
                id,
                InquiryMessageSender.ADMIN
        );

        unreadAdminMessages.forEach(message -> message.setReadByUser(true));
        messageRepo.saveAll(unreadAdminMessages);

        if (!unreadAdminMessages.isEmpty()) {
            inquiry.setAdminReplyReadByUser(true);
            inquiryRepo.save(inquiry);
        }

        return toUserResponse(inquiry);
    }

    @Transactional
    public void deleteForAdmin(Long id) {
        Inquiry inquiry = findInquiryOrThrow(id);
        inquiryRepo.delete(inquiry);
    }

    private void sendInquiryNotificationSafely(Listing listing, Inquiry inquiry) {
        try {
            emailService.sendInquiry(
                    listing.getSeller().getEmail(),
                    INQUIRY_EMAIL_SUBJECT,
                    buildInquiryEmailBody(inquiry)
            );
        } catch (Exception ex) {
            log.warn(
                    "Inquiry was saved, but notification email could not be sent. listingId={}, inquiryId={}, sellerEmail={}",
                    listing.getId(),
                    inquiry.getId(),
                    listing.getSeller().getEmail(),
                    ex
            );
        }
    }

    private String buildInquiryEmailBody(Inquiry inquiry) {
        StringBuilder body = new StringBuilder();

        body.append("You have a new inquiry from ")
                .append(inquiry.getName())
                .append(" (")
                .append(inquiry.getEmail())
                .append(", ")
                .append(inquiry.getPhone())
                .append(")");

        if (inquiry.getMessage() != null && !inquiry.getMessage().isBlank()) {
            body.append("\n\n").append(inquiry.getMessage());
        }

        return body.toString();
    }

    private Inquiry findInquiryOrThrow(Long id) {
        return inquiryRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inquiry", "id", id));
    }

    private void validateAccessToInquiry(Inquiry inquiry, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }

        validateUserOwnsInquiry(inquiry, resolveEmail(authentication));
    }

    private void validateUserOwnsInquiry(Inquiry inquiry, String email) {
        if (!normalizeEmail(inquiry.getEmail()).equals(normalizeEmail(email))) {
            throw new AccessDeniedException("You do not have access to this inquiry.");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }

    private String resolveEmail(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return "";
        }

        return authentication.getName();
    }

    private InquiryDtos.InquiryResponse toResponse(Inquiry saved) {
        return new InquiryDtos.InquiryResponse(
                saved.getId(),
                saved.getListing().getId(),
                saved.getName(),
                saved.getEmail(),
                saved.getPhone(),
                saved.getMessage()
        );
    }

    private InquiryDtos.AdminInquiryResponse toAdminResponse(Inquiry inquiry) {
        return new InquiryDtos.AdminInquiryResponse(
                inquiry.getId(),
                inquiry.getListing().getId(),
                inquiry.getListing().getCar().getMake() + " " + inquiry.getListing().getCar().getModel(),
                inquiry.getName(),
                inquiry.getEmail(),
                inquiry.getPhone(),
                inquiry.getMessage(),
                inquiry.getCreatedAt(),
                inquiry.getAdminReplyMessage(),
                inquiry.getAdminRepliedAt(),
                inquiry.isAdminReplyReadByUser(),
                messageRepo.countByInquiryIdAndSenderTypeAndReadByAdminFalse(inquiry.getId(), InquiryMessageSender.USER),
                findLatestMessageAt(inquiry)
        );
    }

    private InquiryDtos.UserInquiryResponse toUserResponse(Inquiry inquiry) {
        return new InquiryDtos.UserInquiryResponse(
                inquiry.getId(),
                inquiry.getListing().getId(),
                inquiry.getListing().getCar().getMake() + " " + inquiry.getListing().getCar().getModel(),
                inquiry.getMessage(),
                inquiry.getCreatedAt(),
                inquiry.getAdminReplyMessage(),
                inquiry.getAdminRepliedAt(),
                inquiry.isAdminReplyReadByUser(),
                messageRepo.countByInquiryIdAndSenderTypeAndReadByUserFalse(inquiry.getId(), InquiryMessageSender.ADMIN),
                findLatestMessageAt(inquiry)
        );
    }

    private InquiryDtos.InquiryMessageResponse toMessageResponse(InquiryMessage message) {
        return new InquiryDtos.InquiryMessageResponse(
                message.getId(),
                message.getInquiry().getId(),
                message.getSenderType(),
                message.getMessage(),
                message.getCreatedAt(),
                message.isReadByUser(),
                message.isReadByAdmin()
        );
    }

    private Instant findLatestMessageAt(Inquiry inquiry) {
        return messageRepo.findTopByInquiryIdOrderByCreatedAtDesc(inquiry.getId())
                .map(InquiryMessage::getCreatedAt)
                .orElse(inquiry.getCreatedAt());
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeRequired(String value) {
        return value == null ? null : value.trim();
    }

    private String normalizeOptional(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim();
    }
}