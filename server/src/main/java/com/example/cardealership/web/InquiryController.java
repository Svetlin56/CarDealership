package com.example.cardealership.web;

import com.example.cardealership.dto.InquiryDtos;
import com.example.cardealership.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping("/{listingId}")
    public ResponseEntity<InquiryDtos.InquiryResponse> create(
            @PathVariable Long listingId,
            @Valid @RequestBody InquiryDtos.InquiryRequest req) {

        return ResponseEntity.ok(
                inquiryService.create(listingId, req)
        );
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<InquiryDtos.AdminInquiryResponse> all() {
        return inquiryService.findAllForAdmin();
    }

    @GetMapping("/my")
    public List<InquiryDtos.UserInquiryResponse> myInquiries(Authentication authentication) {
        return inquiryService.findForCurrentUser(authentication.getName());
    }

    @GetMapping("/my/unread-count")
    public InquiryDtos.UnreadInquiryRepliesResponse unreadReplies(Authentication authentication) {
        return inquiryService.countUnreadRepliesForCurrentUser(authentication.getName());
    }

    @GetMapping("/unread-user-count")
    @PreAuthorize("hasRole('ADMIN')")
    public InquiryDtos.UnreadInquiryRepliesResponse unreadUserMessages() {
        return inquiryService.countUnreadUserMessagesForAdmin();
    }

    @GetMapping("/{id}/messages")
    public List<InquiryDtos.InquiryMessageResponse> messages(
            @PathVariable Long id,
            Authentication authentication) {

        return inquiryService.findMessages(id, authentication);
    }

    @PostMapping("/{id}/messages")
    public InquiryDtos.InquiryMessageResponse sendMessage(
            @PathVariable Long id,
            @Valid @RequestBody InquiryDtos.InquiryMessageRequest req,
            Authentication authentication) {

        return inquiryService.sendMessage(id, req, authentication);
    }

    @PatchMapping("/{id}/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        inquiryService.markMessagesAsRead(id, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reply")
    @PreAuthorize("hasRole('ADMIN')")
    public InquiryDtos.AdminInquiryResponse reply(
            @PathVariable Long id,
            @Valid @RequestBody InquiryDtos.AdminReplyRequest req) {

        return inquiryService.replyForAdmin(id, req);
    }

    @PatchMapping("/{id}/read-reply")
    public InquiryDtos.UserInquiryResponse markReplyAsRead(
            @PathVariable Long id,
            Authentication authentication) {

        return inquiryService.markReplyAsReadForCurrentUser(id, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inquiryService.deleteForAdmin(id);

        return ResponseEntity.noContent().build();
    }
}