package com.healthconcierge.calendar.model;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    private String id;
    private String userId;
    private String title;
    private LocalDateTime dateTime;
    private String doctorName;
    private String location;
    private String notes;
    private Integer reminderSent = 0;
    private LocalDateTime createdAt = LocalDateTime.now();
}
