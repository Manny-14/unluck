import Testing
import Foundation
@testable import Unluck

struct UnluckTests {

    @Test func testDashboardResponseDecoding() throws {
        let json = """
        {
            "habits": [
                {
                    "id": "h-123",
                    "title": "Practice guitar chords",
                    "description": "After morning tea",
                    "identityId": "i-456",
                    "isCompleted": true,
                    "currentStreak": 3
                }
            ],
            "identities": [
                {
                    "id": "i-456",
                    "name": "Musician",
                    "level": "Amateur",
                    "votes": 5
                }
            ]
        }
        """.data(using: .utf8)!
        
        let decoder = JSONDecoder()
        let response = try decoder.decode(DashboardResponse.self, from: json)
        
        #expect(response.habits.count == 1)
        #expect(response.habits[0].id == "h-123")
        #expect(response.habits[0].isCompleted == true)
        #expect(response.habits[0].currentStreak == 3)
        
        #expect(response.identities.count == 1)
        #expect(response.identities[0].id == "i-456")
        #expect(response.identities[0].name == "Musician")
        #expect(response.identities[0].votes == 5)
    }

    @Test func testHabitToggleResponseDecoding() throws {
        let json = """
        {
            "habitId": "h-123",
            "isCompleted": false,
            "currentStreak": 0,
            "identityId": "i-456",
            "identityVotes": 4
        }
        """.data(using: .utf8)!
        
        let decoder = JSONDecoder()
        let response = try decoder.decode(HabitToggleResponse.self, from: json)
        
        #expect(response.habitId == "h-123")
        #expect(response.isCompleted == false)
        #expect(response.currentStreak == 0)
        #expect(response.identityId == "i-456")
        #expect(response.identityVotes == 4)
    }
}
