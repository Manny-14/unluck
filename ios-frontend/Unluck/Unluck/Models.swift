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
    let userId: String
    let createdAt: String
    
    // UI Helpers (calculated or loaded from backend later)
    var lifetimeVotes: Int?
    var momentumPercentage: Int?
}

struct Habit: Codable, Identifiable {
    let id: String
    let title: String
    let description: String?
    let isArchived: Bool
    let userId: String
    let identityId: String?
    let createdAt: String
    
    // Stacking details
    var stackCue: String?
}

struct HabitLog: Codable, Identifiable {
    let id: String
    let habitId: String
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
