import Foundation

struct User: Codable, Identifiable {
    let id: String
    let email: String
    let name: String?
    let createdAt: String
}

struct Identity: Codable, Identifiable {
    let id: String
    let name: String
    var level: String
    var votes: Int
}

struct Habit: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let identityId: String?
    var isCompleted: Bool
    var currentStreak: Int
}

struct HabitLog: Codable, Identifiable {
    let id: String
    let habitId: String
    let localDate: String
    let completedAt: String
}

struct TaskItem: Codable, Identifiable {
    let id: String
    let title: String
    let note: String?
    let dueDate: String?
    let completedAt: String?
    let userId: String
    let identityId: String?
    let cueHabitId: String?
    let temptationWant: String?
    let createdAt: String
    
    var isCompleted: Bool {
        return completedAt != nil
    }
}

struct BundleRule: Codable, Identifiable {
    let id: String
    let needText: String
    let wantText: String
    let userId: String
    let createdAt: String
}

// Wrapper for the unified GET /api/habits response
struct DashboardResponse: Codable {
    let habits: [Habit]
    let identities: [Identity]
}

// Wrapper for the toggle POST response
struct HabitToggleResponse: Codable {
    let habitId: String
    let isCompleted: Bool
    let currentStreak: Int
    let identityId: String?
    let identityVotes: Int
}
