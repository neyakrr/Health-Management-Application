package com.healthconcierge.notify.service;
import com.healthconcierge.notify.model.ScheduledReminder;
import com.healthconcierge.notify.repository.ScheduledReminderRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
@Service
public class NotifyService {
    private final ScheduledReminderRepository scheduledReminderRepository;
    private final JavaMailSender emailSender;
    public NotifyService(ScheduledReminderRepository scheduledReminderRepository, JavaMailSender emailSender) {
        this.scheduledReminderRepository = scheduledReminderRepository;
        this.emailSender = emailSender;
    }
    public String sendReminder(String userId, String message, String channel) {
        if ("email".equalsIgnoreCase(channel)) {
            // Note: In real app, we'd lookup user's email from orchestrator. Assuming user_id is the email here for demo purposes.
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setTo(userId); // using userId as email for demo
            mailMessage.setSubject("Health Concierge Reminder");
            mailMessage.setText(message);
            try {
                emailSender.send(mailMessage);
            } catch (Exception e) {
                System.out.println("Mocking email send: " + message + " to " + userId);
            }
        }
        return "Reminder sent via " + channel;
    }
    public String alertCaregiver(String userId, String caregiverId, String message, String urgency) {
        // Assume consent is already checked by Orchestrator before calling this MCP tool
        System.out.println("Mocking alert to caregiver " + caregiverId + ": " + message);
        return "Alert sent to caregiver.";
    }
    @Transactional
    public String scheduleReminder(String userId, String message, String scheduledAtStr, String recurrence) {
        ScheduledReminder reminder = new ScheduledReminder();
        reminder.setId(UUID.randomUUID().toString());
        reminder.setUserId(userId);
        reminder.setMessage(message);
        reminder.setScheduledAt(LocalDateTime.parse(scheduledAtStr));
        reminder.setRecurrence(recurrence);
        scheduledReminderRepository.save(reminder);
        return "Reminder scheduled.";
    }
}
