// Notification+Names.swift
// Zentrale Definitionen aller benutzerdefinierten Notification-Namen
import Foundation

extension Notification.Name {
    static let wbClosePopover       = Notification.Name("com.wisperbar.closePopover")
    static let wbRecordingStarted   = Notification.Name("com.wisperbar.recordingStarted")
    static let wbRecordingStopped   = Notification.Name("com.wisperbar.recordingStopped")
}
