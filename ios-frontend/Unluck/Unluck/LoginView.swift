import SwiftUI
import ClerkKit
import ClerkKitUI

struct LoginView: View {
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            VStack(spacing: 8) {
                Text("Unluck")
                    .font(Theme.editorialHeader(size: 42))
                    .foregroundColor(Theme.espresso)
                
                Text("Habits and systems to unluck your potential.")
                    .font(Theme.editorialBody(size: 16))
                    .italic()
                    .foregroundColor(Theme.mutedText)
                    .multilineTextAlignment(.center)
            }
            .padding(.bottom, 32)
            
            // Clerk's prebuilt UI containing Sign In/Sign Up
            ClerkKitUI.AuthView()
            
            Spacer()
        }
        .padding()
        .background(Theme.ash.ignoresSafeArea())
    }
}

struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
