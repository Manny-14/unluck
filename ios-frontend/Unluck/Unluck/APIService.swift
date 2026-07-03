import Foundation
import ClerkKit

struct HealthStatus: Codable {
    let status: String
    let message: String
    let timestamp: String
}

class APIService {
    static let shared = APIService()
    
    private let baseURLString: String = {
        if let path = Bundle.main.path(forResource: "Secrets", ofType: "plist"),
           let dict = NSDictionary(contentsOfFile: path),
           let url = dict["BaseURL"] as? String {
            return url
        }
        return "http://localhost:5001/api"
    }()
    
    private init() {}
    
    private func attachAuthToken(to request: inout URLRequest) async throws {
        // Clerk.shared.session is likely bound to @MainActor, requiring `await` to access from APIService
        if let session = await Clerk.shared.session {
            // session.getToken() returns a String directly
            let token = try await session.getToken()
            if let tokenString = token as? String {
                request.setValue("Bearer \(tokenString)", forHTTPHeaderField: "Authorization")
            }
        }
    }
    
    /// Queries the backend API health status endpoint
    func fetchHealthStatus() async throws -> HealthStatus {
        guard let url = URL(string: "\(baseURLString)/health") else {
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.timeoutInterval = 10.0
        
        // Health endpoint doesn't strictly need auth, but good practice
        try await attachAuthToken(to: &request)
        
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
        
        try await attachAuthToken(to: &request)
        
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
        
        try await attachAuthToken(to: &request)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, httpResponse.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        
        let decoder = JSONDecoder()
        return try decoder.decode(HabitToggleResponse.self, from: data)
    }
}
