# Campus Notification System Design

## Stage 1: REST API & Real-time Strategy
**Endpoints:**
- `GET /notifications`: Fetch sorted notifications for the logged-in student.
- `PATCH /notifications/:id/read`: Mark a notification as read.
- `GET /notifications/unread-count`: Get the total count of unread alerts.

**Real-time Delivery:** I recommend using **WebSockets (Socket.io)**. Unlike polling, WebSockets allow the server to push high-priority Placement alerts to the student instantly, reducing latency and server load.

## Stage 2: Database Schema
**Database:** PostgreSQL (Relational)
**Reasoning:** Relational integrity is required to link notifications to specific student IDs and maintain "Read/Unread" states consistently.

**Schema:**
- `Notifications`: {id: UUID, student_id: INT, type: ENUM, content: TEXT, is_read: BOOL, created_at: TIMESTAMP}

## Stage 3: Query Optimization
**The Problem:** Querying 5M+ rows with `WHERE studentID = X AND isRead = false` causes a full table scan.
**The Solution:** Create a **Composite Index**:
```sql
CREATE INDEX idx_student_unread_date ON notifications (studentID, isRead, createdAt DESC);