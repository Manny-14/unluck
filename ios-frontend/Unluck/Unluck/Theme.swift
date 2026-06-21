import SwiftUI

struct Theme {
    // Brand Color Palette (Tactile Earthy Tones)
    static let ash = Color(red: 242/255, green: 239/255, blue: 233/255)
    static let espresso = Color(red: 44/255, green: 37/255, blue: 35/255)
    static let forestGreen = Color(red: 54/255, green: 89/255, blue: 66/255)
    static let slateBlue = Color(red: 74/255, green: 107/255, blue: 130/255)
    static let terracotta = Color(red: 184/255, green: 125/255, blue: 101/255)
    
    // Auxiliary tones
    static let mutedText = Color(red: 110/255, green: 105/255, blue: 100/255)
    static let border = Color(red: 220/255, green: 215/255, blue: 205/255)
    static let paper = Color(red: 248/255, green: 246/255, blue: 242/255)
    
    // Typography helpers using iOS System Fonts (Georgia serif & System Sans)
    static func editorialHeader(size: CGFloat) -> Font {
        return Font.custom("Georgia", size: size).weight(.bold)
    }
    
    static func editorialBody(size: CGFloat) -> Font {
        return Font.custom("Georgia", size: size)
    }
    
    static func sansBold(size: CGFloat) -> Font {
        return Font.system(size: size, weight: .bold, design: .default)
    }
    
    static func sansMedium(size: CGFloat) -> Font {
        return Font.system(size: size, weight: .medium, design: .default)
    }
    
    static func sansRegular(size: CGFloat) -> Font {
        return Font.system(size: size, weight: .regular, design: .default)
    }
}
