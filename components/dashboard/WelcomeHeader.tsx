'use client'

export default function WelcomeHeader() {
  const currentHour = new Date().getHours()
  
  const getGreeting = () => {
    if (currentHour < 12) return "Good morning"
    if (currentHour < 18) return "Good afternoon"
    return "Good evening"
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to discover your next great read?",
      "What story will you dive into today?",
      "Time to turn the page on something new!",
      "Your next literary adventure awaits!"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold text-foreground">
        {getGreeting()}, Andrzej! 👋
      </h1>
      <p className="text-muted-foreground">
        {getMotivationalMessage()}
      </p>
    </div>
  )
} 