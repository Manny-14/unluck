import Foundation
import Combine

/**
 * View Model managing state, optimistic UI updates, and backend synchronization for the Dashboard.
 */
@MainActor
class DashboardViewModel: ObservableObject {
    @Published var healthMessage = "Checking server..."
    @Published var isConnected = false
    
    // Dynamic states linked to the database via APIService
    @Published var habits: [Habit] = []
    @Published var identities: [Identity] = []
    
    // Static local tasks for demonstration of temptation bundling
    struct TaskItem: Identifiable {
        let id: Int
        let title: String
        let reward: String
        var isCompleted: Bool
    }
    
    @Published var tasks = [
        TaskItem(id: 1, title: "Clean desk setup", reward: "Listen to music while cleaning", isCompleted: false)
    ]
    
    @Published var showCuePopup = false
    @Published var pendingCueHabit = ""
    
    /**
     * Helper function returning the client's current date formatted as YYYY-MM-DD.
     */
    private func getLocalDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }
    
    /**
     * Checks the backend API health status.
     */
    func checkBackendConnection() {
        Task {
            do {
                let health = try await APIService.shared.fetchHealthStatus()
                self.healthMessage = health.message
                self.isConnected = true
            } catch {
                print("DEBUG APIService Connection Error: \(error)")
                self.healthMessage = "Offline"
                self.isConnected = false
            }
        }
    }
    
    /**
     * Fetches habits and identities for the current local date.
     */
    func fetchDashboard() {
        Task {
            do {
                let dateStr = getLocalDateString()
                let response = try await APIService.shared.fetchDashboard(date: dateStr)
                self.habits = response.habits
                self.identities = response.identities
                self.isConnected = true
            } catch {
                print("DEBUG fetchDashboard Error: \(error)")
                self.isConnected = false
            }
        }
    }
    
    /**
     * Toggles a habit's completion status, applying optimistic UI updates and syncing with backend.
     */
    func toggleHabit(id: String) {
        // 1. Optimistic UI update
        if let index = habits.firstIndex(where: { $0.id == id }) {
            let wasCompleted = habits[index].isCompleted
            habits[index].isCompleted.toggle()
            habits[index].currentStreak = wasCompleted ? max(0, habits[index].currentStreak - 1) : habits[index].currentStreak + 1
        }
        
        Task {
            do {
                let dateStr = getLocalDateString()
                let response = try await APIService.shared.toggleHabit(id: id, date: dateStr)
                
                // Re-align with server truth
                if let index = self.habits.firstIndex(where: { $0.id == id }) {
                    self.habits[index].isCompleted = response.isCompleted
                    self.habits[index].currentStreak = response.currentStreak
                }
                
                // Update matching identity votes
                if let identityId = response.identityId,
                   let index = self.identities.firstIndex(where: { $0.id == identityId }) {
                    self.identities[index].votes = response.identityVotes
                    
                    let v = response.identityVotes
                    var level = "Novice"
                    if v >= 10 { level = "Expert" }
                    else if v >= 5 { level = "Amateur" }
                    else if v >= 2 { level = "Beginner" }
                    self.identities[index].level = level
                }
            } catch {
                print("DEBUG toggleHabit Error: \(error)")
                // Rollback on error
                self.fetchDashboard()
            }
        }
    }
    
    /**
     * Toggles a static task and triggers the habit cue popup if completed.
     */
    func toggleTask(id: Int) {
        if let index = tasks.firstIndex(where: { $0.id == id }) {
            tasks[index].isCompleted.toggle()
            if tasks[index].isCompleted {
                pendingCueHabit = "Practice chords"
                showCuePopup = true
            }
        }
    }
}
