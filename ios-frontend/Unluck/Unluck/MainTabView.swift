import SwiftUI

struct MainTabView: View {
    @State private var healthMessage = "Checking server..."
    @State private var isConnected = false
    
    // Dynamic states linked to the database via APIService
    @State private var habits: [Habit] = []
    @State private var identities: [Identity] = []
    @State private var tasks = [
        (id: 1, title: "Clean desk setup", reward: "Listen to music while cleaning", isCompleted: false)
    ]
    
    @State private var showCuePopup = false
    @State private var pendingCueHabit = ""

    var body: some View {
        TabView {
            // Today Tab
            NavigationStack {
                TodayView()
            }
            .tabItem {
                Label("Today", systemImage: "doc.plaintext")
            }
            
            // Identities Tab
            NavigationStack {
                IdentitiesView()
            }
            .tabItem {
                Label("Identities", systemImage: "person.crop.circle")
            }
            
            // Playbook Tab
            NavigationStack {
                PlaybookView()
            }
            .tabItem {
                Label("Playbook", systemImage: "compass.drawing")
            }
        }
        .accentColor(Theme.forestGreen)
        .onAppear {
            checkBackendConnection()
            fetchDashboard()
        }
    }
    
    private func getLocalDateString() -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: Date())
    }
    
    private func checkBackendConnection() {
        Task {
            do {
                let health = try await APIService.shared.fetchHealthStatus()
                await MainActor.run {
                    self.healthMessage = health.message
                    self.isConnected = true
                }
            } catch {
                print("DEBUG APIService Connection Error: \(error)")
                await MainActor.run {
                    self.healthMessage = "Offline"
                    self.isConnected = false
                }
            }
        }
    }
    
    private func fetchDashboard() {
        Task {
            do {
                let dateStr = getLocalDateString()
                let response = try await APIService.shared.fetchDashboard(date: dateStr)
                await MainActor.run {
                    self.habits = response.habits
                    self.identities = response.identities
                    self.isConnected = true
                }
            } catch {
                print("DEBUG fetchDashboard Error: \(error)")
                await MainActor.run {
                    self.isConnected = false
                }
            }
        }
    }
    
    private func toggleHabit(id: String) {
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
                
                await MainActor.run {
                    // Re-align with server truth
                    if let index = habits.firstIndex(where: { $0.id == id }) {
                        habits[index].isCompleted = response.isCompleted
                        habits[index].currentStreak = response.currentStreak
                    }
                    
                    // Update matching identity votes
                    if let identityId = response.identityId,
                       let index = identities.firstIndex(where: { $0.id == identityId }) {
                        identities[index].votes = response.identityVotes
                        
                        let v = response.identityVotes
                        var level = "Novice"
                        if v >= 10 { level = "Expert" }
                        else if v >= 5 { level = "Amateur" }
                        else if v >= 2 { level = "Beginner" }
                        identities[index].level = level
                    }
                }
            } catch {
                print("DEBUG toggleHabit Error: \(error)")
                await MainActor.run {
                    fetchDashboard() // Rollback on error
                }
            }
        }
    }
    
    // MARK: - Today Tab View
    @ViewBuilder
    func TodayView() -> some View {
        let maxStreak = habits.map { $0.currentStreak }.max() ?? 0
        
        ZStack {
            Theme.ash.ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    
                    // Editorial Header
                    VStack(alignment: .leading, spacing: 6) {
                        Text(Date.now.formatted(date: .complete, time: .omitted).uppercased())
                            .font(Theme.sansBold(size: 11))
                            .foregroundColor(Theme.terracotta)
                            .tracking(1.5)
                        
                        Text("Day Planner")
                            .font(Theme.editorialHeader(size: 34))
                            .foregroundColor(Theme.espresso)
                        
                        Text("“Every action you take is a vote for the type of person you wish to become.”")
                            .font(Theme.editorialBody(size: 14))
                            .italic()
                            .foregroundColor(Theme.mutedText)
                            .padding(.top, 4)
                            .lineSpacing(4)
                    }
                    .padding(.horizontal)
                    .padding(.top, 16)
                    
                    // Server status badge
                    HStack(spacing: 8) {
                        Circle()
                            .fill(isConnected ? Theme.forestGreen : .red)
                            .frame(width: 8, height: 8)
                        Text(isConnected ? "Server connected" : "Server disconnected (Tailscale local server)")
                            .font(Theme.sansMedium(size: 11))
                            .foregroundColor(Theme.mutedText)
                    }
                    .padding(.horizontal)
                    
                    Divider()
                        .background(Theme.border)
                        .padding(.horizontal)
                    
                    // Habits Section
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Text("Daily Habits")
                                .font(Theme.editorialHeader(size: 20))
                                .foregroundColor(Theme.espresso)
                            Spacer()
                            HStack(spacing: 4) {
                                Image(systemName: "flame.fill")
                                    .foregroundColor(Theme.terracotta)
                                Text("\(maxStreak) Day Streak")
                                    .font(Theme.sansBold(size: 12))
                                    .foregroundColor(Theme.espresso)
                            }
                        }
                        
                        if habits.isEmpty {
                            Text("Loading habits...")
                                .font(Theme.sansMedium(size: 14))
                                .foregroundColor(Theme.mutedText)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            ForEach(habits) { habit in
                                HStack(alignment: .top, spacing: 12) {
                                    Button {
                                        toggleHabit(id: habit.id)
                                    } label: {
                                        Image(systemName: habit.isCompleted ? "checkmark.circle.fill" : "circle")
                                            .font(.title3)
                                            .foregroundColor(habit.isCompleted ? Theme.forestGreen : Theme.mutedText)
                                    }
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(habit.title)
                                            .font(Theme.sansMedium(size: 16))
                                            .strikethrough(habit.isCompleted)
                                            .foregroundColor(habit.isCompleted ? Theme.mutedText : Theme.espresso)
                                        
                                        if let desc = habit.description, !desc.isEmpty {
                                            Text(desc)
                                                .font(Theme.sansRegular(size: 12))
                                                .foregroundColor(Theme.mutedText)
                                        }
                                    }
                                    Spacer()
                                }
                                .padding()
                                .background(Theme.paper)
                                .cornerRadius(Theme.radiusSm)
                                .overlay(
                                    RoundedRectangle(cornerRadius: Theme.radiusSm)
                                        .stroke(Theme.border, lineWidth: 1)
                                )
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    // Tasks Section
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Linked Tasks")
                            .font(Theme.editorialHeader(size: 20))
                            .foregroundColor(Theme.espresso)
                        
                        ForEach(0..<tasks.count, id: \.self) { idx in
                            HStack(alignment: .top, spacing: 12) {
                                Button {
                                    tasks[idx].isCompleted.toggle()
                                    if tasks[idx].isCompleted {
                                        pendingCueHabit = "Practice chords"
                                        showCuePopup = true
                                    }
                                } label: {
                                    Image(systemName: tasks[idx].isCompleted ? "checkmark.square.fill" : "square")
                                        .font(.title3)
                                        .foregroundColor(tasks[idx].isCompleted ? Theme.slateBlue : Theme.mutedText)
                                }
                                
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(tasks[idx].title)
                                        .font(Theme.sansMedium(size: 16))
                                        .strikethrough(tasks[idx].isCompleted)
                                        .foregroundColor(tasks[idx].isCompleted ? Theme.mutedText : Theme.espresso)
                                    
                                    HStack(spacing: 4) {
                                        Image(systemName: "sparkles")
                                            .foregroundColor(Theme.terracotta)
                                        Text(tasks[idx].reward)
                                            .font(Theme.sansRegular(size: 12))
                                            .foregroundColor(Theme.mutedText)
                                    }
                                    .padding(.top, 2)
                                }
                                Spacer()
                            }
                            .padding()
                            .background(Theme.paper)
                            .cornerRadius(Theme.radiusSm)
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.radiusSm)
                                    .stroke(Theme.border, lineWidth: 1)
                             )
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 32)
            }
        }
        .alert("Habit Stack Cue Triggered!", isPresented: $showCuePopup) {
            Button("I'll do it now", role: .none) {
                // stack transition
            }
            Button("Later", role: .cancel) {}
        } message: {
            Text("You completed your task. Now stack the habit: '\(pendingCueHabit)'!")
        }
    }
    
    // MARK: - Identities Tab View
    @ViewBuilder
    func IdentitiesView() -> some View {
        ZStack {
            Theme.ash.ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("My Identity")
                        .font(Theme.editorialHeader(size: 32))
                        .foregroundColor(Theme.espresso)
                        .padding(.horizontal)
                        .padding(.top, 16)
                    
                    VStack(spacing: 16) {
                        if identities.isEmpty {
                            Text("Loading identities...")
                                .font(Theme.sansMedium(size: 14))
                                .foregroundColor(Theme.mutedText)
                                .padding()
                                .frame(maxWidth: .infinity, alignment: .center)
                        } else {
                            ForEach(identities) { identity in
                                let momentumPercent = min(100, Int(Double(identity.votes) / 10.0 * 100))
                                let accentColor: Color = identity.name == "Musician" ? Theme.forestGreen : (identity.name == "Writer" ? Theme.slateBlue : Theme.terracotta)
                                
                                IdentityCard(
                                    name: identity.name,
                                    votes: identity.votes,
                                    level: identity.level,
                                    momentum: momentumPercent,
                                    color: accentColor
                                )
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 32)
            }
        }
    }
    
    @ViewBuilder
    func IdentityCard(name: String, votes: Int, level: String, momentum: Int, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(name)
                        .font(Theme.editorialHeader(size: 20))
                        .foregroundColor(Theme.espresso)
                    Text("Level: \(level)")
                        .font(Theme.sansBold(size: 12))
                        .foregroundColor(Theme.mutedText)
                }
                Spacer()
                
                // Momentum Circle
                ZStack {
                    Circle()
                        .stroke(Theme.border, lineWidth: 6)
                        .frame(width: 50, height: 50)
                    
                    Circle()
                        .trim(from: 0.0, to: CGFloat(momentum) / 100.0)
                        .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                        .frame(width: 50, height: 50)
                        .rotationEffect(Angle(degrees: -90))
                    
                    Text("\(momentum)%")
                        .font(Theme.sansBold(size: 11))
                        .foregroundColor(Theme.espresso)
                }
            }
            
            Divider()
                .background(Theme.border)
            
            HStack {
                Text("\(votes) votes cast")
                    .font(Theme.sansMedium(size: 13))
                    .foregroundColor(Theme.mutedText)
                Spacer()
                Image(systemName: "checkmark.seal.fill")
                    .foregroundColor(color)
            }
        }
        .padding()
        .background(Theme.paper)
        .cornerRadius(Theme.radiusMd)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusMd)
                .stroke(Theme.border, lineWidth: 1)
        )
    }
    
    // MARK: - Playbook Tab View
    @ViewBuilder
    func PlaybookView() -> some View {
        ZStack {
            Theme.ash.ignoresSafeArea()
            
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Temptation Rules")
                        .font(Theme.editorialHeader(size: 32))
                        .foregroundColor(Theme.espresso)
                        .padding(.horizontal)
                        .padding(.top, 16)
                    
                    VStack(spacing: 16) {
                        RuleCard(idx: 1, need: "Walk on treadmill", want: "Watch favorite TV series")
                        RuleCard(idx: 2, need: "Complete weekly planner", want: "Listen to new music albums")
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 32)
            }
        }
    }
    
    @ViewBuilder
    func RuleCard(idx: Int, need: String, want: String) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Rule #\(idx)")
                .font(Theme.sansBold(size: 11))
                .foregroundColor(Theme.terracotta)
                .tracking(1)
            
            Text("I will \(need)")
                .font(Theme.sansMedium(size: 16))
                .foregroundColor(Theme.espresso)
            
            HStack(spacing: 6) {
                Image(systemName: "sparkles")
                    .foregroundColor(Theme.forestGreen)
                Text("while I \(want)")
                    .font(Theme.editorialBody(size: 14))
                    .foregroundColor(Theme.mutedText)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Theme.paper)
        .cornerRadius(Theme.radiusSm)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusSm)
                .stroke(Theme.border, lineWidth: 1)
        )
    }
}

// Layout helper for radius
extension Theme {
    static let radius: CGFloat = 12
    static let radiusSm: CGFloat = 8
    static let radiusMd: CGFloat = 14
}
