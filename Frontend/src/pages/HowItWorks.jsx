import React from 'react';
import { FileText, Printer, Phone, MessageCircle, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageTransition } from '@/components/animations/PageTransition';
import { cn } from '@/lib/utils';
import { useOutletContext } from 'react-router-dom';

function HowItWorks() {
  const { mode: darkMode } = useOutletContext();

  const themes = {
    dark: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-900 via-black to-blue-900",
      text: "text-white", 
      cardBg: "backdrop-blur-2xl bg-black/[0.7]",
      border: "border-white/[0.1]",
      gradientOverlay: "from-green-500/[0.05] via-transparent to-blue-500/[0.05]",
      accentGradient: "from-white to-gray-300",
      iconBg: "from-white/20 to-white/10",
      buttonGradient: "bg-gradient-to-r from-green-500 to-blue-500",
      hoverGradient: "hover:from-green-600 hover:to-blue-600"
    },
    light: {
      background: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-100 via-white to-gray-200",
      text: "text-black",
      cardBg: "backdrop-blur-2xl bg-white/[0.9]",
      border: "border-black/[0.1]",
      gradientOverlay: "from-gray-500/[0.05] via-transparent to-gray-500/[0.05]",
      accentGradient: "from-black to-gray-800",
      iconBg: "from-black/20 to-black/10",
      buttonGradient: "bg-gradient-to-r from-green-400 to-blue-400",
      hoverGradient: "hover:from-green-500 hover:to-blue-500"
    }
  };

  const currentTheme = darkMode ? themes.dark : themes.light;

  const steps = [
    {
      title: "Create an Account",
      description: "Sign up for a new account with your details to get started",
      icon: FileText
    },
    {
      title: "Choose Your Print Option", 
      description: "Select from admin-uploaded assignments or upload your own PDF via custom print",
      icon: Printer
    },
    {
      title: "Make Payment",
      description: "Pay the required amount via UPI",
      icon: FileText
    },
    {
      title: "Track Status",
      description: "Check your print history to view current status of your prints",
      icon: FileText
    }
  ];

  const contactInfo = {
    phone: "7906525080",
    instructions: "You will receive a message or you can call to confirm pickup time and location within the college premises"
  };

  const team = [
    {
      name: "Dikshit Mahanot",
      role: "The Man Behind Tech",
      image: "https://media.licdn.com/dms/image/v2/D5603AQGuhak9GlJu2g/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1728203108742?e=1744243200&v=beta&t=D7xJV4Ecp8WE922Q50Nmq3p0EoBcqj3aEuBCg43HZ50",
      linkedin: "https://www.linkedin.com/in/dikshit-mahanot"
    },
    {
      name: "Aryan Chauhan",
      role: "The Man Behind Execution",
      image: "https://media.licdn.com/dms/image/v2/D5603AQFjPry4naSHqQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1730448020553?e=1744243200&v=beta&t=Ht6lFI9Htcr7FOWZWFSQGu0SDHLszrZ6-aLUTwmQ5P0", 
      linkedin: "https://www.linkedin.com/in/itsaryanchauhan/"
    }
  ];

  return (
    <PageTransition>
      <div className={cn("max-w-4xl mx-auto px-4 py-8", currentTheme.text)}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-4">How It Works</h1>
          <p className={cn("text-lg", darkMode ? "text-gray-300" : "text-gray-600")}>Follow these simple steps to get your documents printed</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2 }}
                className={cn("p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow border", currentTheme.cardBg, currentTheme.border)}
              >
                <div className="flex items-center mb-4">
                  <div className={cn("p-3 rounded-full bg-gradient-to-br", currentTheme.buttonGradient)}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-xl font-semibold">{step.title}</h3>
                </div>
                <p className={darkMode ? "text-gray-300" : "text-gray-600"}>{step.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className={cn("p-8 rounded-lg shadow-lg border mb-16", currentTheme.cardBg, currentTheme.border)}
        >
          <h2 className="text-2xl font-bold mb-4">How to Collect Your Prints</h2>
          <div className="flex items-center mb-4">
            <Phone className="h-6 w-6 mr-3" />
            <p className="text-lg">Contact: {contactInfo.phone}</p>
          </div>
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-3" />
            <p className="text-lg">{contactInfo.instructions}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-8">About Us</h2>
          <div className="grid gap-8 md:grid-cols-2">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 + 1 }}
                className={cn("p-6 rounded-lg shadow-lg border", currentTheme.cardBg, currentTheme.border)}
              >
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                <p className={cn("mb-4", darkMode ? "text-gray-300" : "text-gray-600")}>{member.role}</p>
                <a 
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full transition-colors", currentTheme.buttonGradient, "text-white hover:opacity-90")}
                >
                  <Linkedin className="h-4 w-4" />
                  Connect on LinkedIn
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
}

export default HowItWorks;