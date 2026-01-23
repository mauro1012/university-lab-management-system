package models

type LabStatus struct {
    ID        string `json:"id"`
    Name      string `json:"name"`
    Status    string `json:"status"` // "AVAILABLE" o "BUSY"
    TimeLeft  int    `json:"time_left_minutes,omitempty"`
}