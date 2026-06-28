import Foundation

struct HealthStatus: Codable {
    let status: String
    let message: String
    let timestamp: String
}

class APIService {
    static let shared = APIService()
    
    // Configured base URL for local server over Tailscale
    private let baseURLString = "http://emmanuels-laptop.tailb2dd90.ts.net:5001/api"
    
    private init() {}
    
    /// Queries the backend API health status endpoint
    func fetchHealthStatus() async throws -> HealthStatus {
        guard let url = URL(string: "\(baseURLString)/health") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 10.0
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(HealthStatus.self, from: data)
    }
    
    /// Fetches habits and identities for a specific local calendar date
    func fetchDashboard(date: String) async throws -> DashboardResponse {
        guard let url = URL(string: "\(baseURLString)/habits?date=\(date)") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 10.0
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(DashboardResponse.self, from: data)
    }
    
    /// Toggles a habit complete/incomplete on the backend
    func toggleHabit(id: String, date: String) async throws -> HabitToggleResponse {
        guard let url = URL(string: "\(baseURLString)/habits/\(id)/toggle") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.timeoutInterval = 10.0
        
        let body: [String: String] = ["date": date]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(HabitToggleResponse.self, from: data)
    }
}
