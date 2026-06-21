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
}
