package com.healthconcierge.notify.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "scheduled_reminders")
public class ScheduledReminder {
    @Id
    private String id;
    private String userId;
    private String message;
    private String channel = "email";
    private LocalDateTime scheduledAt;
    private String recurrence;
    private Integer sent = 0;
}
