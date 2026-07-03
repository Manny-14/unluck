//
//  UnluckApp.swift
//  Unluck
//
//  Created by Emmanuel Okorie on 6/21/26.
//

import SwiftUI
import ClerkKit
import ClerkKitUI

@main
struct UnluckApp: App {
    
    init() {
        if let path = Bundle.main.path(forResource: "Secrets", ofType: "plist"),
           let dict = NSDictionary(contentsOfFile: path),
           let clerkKey = dict["ClerkPublishableKey"] as? String {
            Clerk.configure(publishableKey: clerkKey)
        } else {
            print("WARNING: ClerkPublishableKey not found in Secrets.plist")
            // Prevent fatal crash if the user forgot to add the key
            Clerk.configure(publishableKey: "pk_test_missing_key")
        }
    }
    
    var body: some Scene {
        WindowGroup {
            if Clerk.shared.session != nil {
                ContentView()
                    .environment(Clerk.shared)
            } else {
                LoginView()
                    .environment(Clerk.shared)
            }
        }
    }
}
