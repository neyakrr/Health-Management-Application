package com.healthconcierge.notify.repository;
import com.healthconcierge.notify.model.ScheduledReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
public interface ScheduledReminderRepository extends JpaRepository<ScheduledReminder, String> {
    List<ScheduledReminder> findByScheduledAtBeforeAndSent(LocalDateTime time, Integer sent);
}
