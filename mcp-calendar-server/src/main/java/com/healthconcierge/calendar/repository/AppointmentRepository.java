package com.healthconcierge.calendar.repository;

import com.healthconcierge.calendar.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, String> {

    // Returns all appointments for a user sorted by date — no future-only filter
    List<Appointment> findByUserIdOrderByDateTimeAsc(String userId);
}