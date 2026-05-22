package com.example.cardealership.repository;

import com.example.cardealership.domain.InquiryMessage;
import com.example.cardealership.domain.InquiryMessageSender;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InquiryMessageRepository extends JpaRepository<InquiryMessage, Long> {

    List<InquiryMessage> findByInquiryIdOrderByCreatedAtAsc(Long inquiryId);

    Optional<InquiryMessage> findTopByInquiryIdOrderByCreatedAtDesc(Long inquiryId);

    List<InquiryMessage> findByInquiryIdAndSenderTypeAndReadByUserFalse(
            Long inquiryId,
            InquiryMessageSender senderType
    );

    List<InquiryMessage> findByInquiryIdAndSenderTypeAndReadByAdminFalse(
            Long inquiryId,
            InquiryMessageSender senderType
    );

    long countByInquiryIdAndSenderTypeAndReadByUserFalse(
            Long inquiryId,
            InquiryMessageSender senderType
    );

    long countByInquiryIdAndSenderTypeAndReadByAdminFalse(
            Long inquiryId,
            InquiryMessageSender senderType
    );

    long countByInquiry_EmailIgnoreCaseAndSenderTypeAndReadByUserFalse(
            String email,
            InquiryMessageSender senderType
    );

    long countBySenderTypeAndReadByAdminFalse(InquiryMessageSender senderType);
}