package com.healthconcierge.orchestrator.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendCaregiverInvite(String toEmail, String caregiverName, String patientName, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("You've been added as a caregiver – Health Concierge");
            String html = buildInviteEmail(caregiverName, patientName, toEmail, tempPassword);
            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            // Log but do not fail the invite flow if email sending fails
            System.err.println("[EmailService] Failed to send caregiver invite to " + toEmail + ": " + e.getMessage());
        }
    }

    private String buildInviteEmail(String caregiverName, String patientName, String email, String password) {
        return "<!DOCTYPE html><html><body style=\"font-family:Inter,sans-serif;background:#F3F4F6;padding:2rem;\">" +
               "<div style=\"max-width:500px;margin:auto;background:white;border-radius:12px;padding:2rem;box-shadow:0 4px 12px rgba(0,0,0,0.1);\">" +
               "<h2 style=\"color:#4F46E5;margin-top:0;\">Health Concierge</h2>" +
               "<p>Hello <strong>" + caregiverName + "</strong>,</p>" +
               "<p><strong>" + patientName + "</strong> has added you as a caregiver on the Health Concierge platform. " +
               "You can log in to view their health records (read-only) using the credentials below.</p>" +
               "<div style=\"background:#F3F4F6;border-radius:8px;padding:1rem;margin:1.5rem 0;\">" +
               "<p style=\"margin:0.25rem 0;\"><strong>Login URL:</strong> http://localhost:3000/login</p>" +
               "<p style=\"margin:0.25rem 0;\"><strong>Email:</strong> " + email + "</p>" +
               "<p style=\"margin:0.25rem 0;\"><strong>Temporary Password:</strong> <code style=\"background:#E0E7FF;padding:0.2rem 0.5rem;border-radius:4px;\">" + password + "</code></p>" +
               "</div>" +
               "<p style=\"color:#6B7280;font-size:0.85rem;\">Select <strong>\"Caregiver\"</strong> on the login page. " +
               "We recommend changing your password after first login.</p>" +
               "<p style=\"color:#9CA3AF;font-size:0.75rem;\">This invitation was sent by the Health Concierge platform.</p>" +
               "</div></body></html>";
    }
}
