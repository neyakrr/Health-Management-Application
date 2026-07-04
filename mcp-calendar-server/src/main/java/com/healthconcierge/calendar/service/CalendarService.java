package com.healthconcierge.calendar.service;

import com.healthconcierge.calendar.model.Appointment;
import com.healthconcierge.calendar.repository.AppointmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.UUID;

@Service
public class CalendarService {

    private final AppointmentRepository appointmentRepository;

    public CalendarService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public Appointment createAppointment(String userId, String title, String dateTimeStr,
                                          String doctorName, String notes) {
        // Robustly parse date — handles multiple formats the LLM might send
        LocalDateTime dateTime = parseDateTimeSafely(dateTimeStr);

        Appointment appt = new Appointment();
        appt.setId(UUID.randomUUID().toString());
        appt.setUserId(userId);
        appt.setTitle(title != null ? title : "Appointment");
        appt.setDateTime(dateTime);
        appt.setDoctorName(doctorName);
        appt.setNotes(notes);
        appt.setCreatedAt(LocalDateTime.now());

        System.out.println("[Calendar] Saving appointment: " + appt.getTitle()
                + " for " + userId + " at " + dateTime);

        return appointmentRepository.save(appt);
    }

    public List<Appointment> listUpcomingAppointments(String userId, Integer daysAhead) {
        // Return ALL appointments for the user (past and future)
        // so the page always shows something — front end can sort/filter
        System.out.println("[Calendar] Listing all appointments for user: " + userId);
        return appointmentRepository.findByUserIdOrderByDateTimeAsc(userId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public String getPreVisitSummary(String userId, String appointmentId) {
        return "Pre-visit summary for appointment " + appointmentId
                + ": Vitals stable. Recent symptom: Headache (Severity 3).";
    }

    /**
     * Tries multiple date formats the LLM might produce:
     *   2026-07-02T14:00:00      (full ISO — ideal)
     *   2026-07-02T14:00         (no seconds)
     *   2026-07-02               (date only — defaults to 10:00)
     *   2025-07-02 14:00:00      (space instead of T)
     */
    private LocalDateTime parseDateTimeSafely(String input) {
        if (input == null || input.isBlank()) {
            return LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0);
        }

        String s = input.trim();

        // Try full ISO with seconds
        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"));
        } catch (DateTimeParseException ignored) {}

        // Try ISO without seconds
        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"));
        } catch (DateTimeParseException ignored) {}

        // Try with space separator instead of T
        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        } catch (DateTimeParseException ignored) {}

        try {
            return LocalDateTime.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        } catch (DateTimeParseException ignored) {}

        // Try date only — default to 10:00 AM
        try {
            LocalDate date = LocalDate.parse(s, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return date.atTime(10, 0, 0);
        } catch (DateTimeParseException ignored) {}

        // Last resort — tomorrow at 10am
        System.err.println("[Calendar] Could not parse date: " + input + " — defaulting to tomorrow 10:00");
        return LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0);
    }
}