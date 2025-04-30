'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { ArrowRight, Code, Sparkles, Zap, Github, Twitter, Star, Heart, Share2, Facebook, Linkedin, Instagram } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import ThemeSwitcher from './components/ThemeSwitcher';
import SocialFooter from './components/SocialFooter';
import { MagnifyingGlassIcon, CodeBracketIcon, PlayIcon } from './components/Icons';
import MouseTrail from './components/MouseTrail';

// Use dynamic import for the 3D component to avoid SSR issues
const Background3D = dynamic(
  () => import('./components/Background3D'),
  { ssr: false }
);

export default function HomePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);

  const socialLinks = [
    {
      icon: <Facebook className="h-5 w-5" />,
      url: 'https://www.facebook.com/bhola123.net.np',
      label: 'Facebook',
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      url: 'https://www.linkedin.com/in/bhya23cse/',
      label: 'LinkedIn',
    },
    {
      icon: <Instagram className="h-5 w-5" />,
      url: 'https://www.instagram.com/its_me_yadav_ji24/',
      label: 'Instagram',
    },
    {
      icon: <Github className="h-5 w-5" />,
      url: 'https://github.com/Bhya23cse',
      label: 'GitHub',
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'AI Code Debugger',
        text: 'Check out this amazing AI-powered code debugger!',
        url: window.location.href,
      }).catch((error) => {
        console.log('Error sharing:', error);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      setShowShareTooltip(true);
      setTimeout(() => setShowShareTooltip(false), 2000);
    }
  };

  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Smart Code Analysis',
      description: 'Advanced AI-powered code analysis to identify bugs and potential issues.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Real-time Suggestions',
      description: 'Get instant suggestions and improvements as you type your code.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Performance Optimization',
      description: 'Optimize your code for better performance and efficiency.',
      color: 'from-green-500 to-green-600',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const cardVariants = {
    hover: {
      y: -10,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50"
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <motion.h1 
              className="text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              AI Code Debugger
            </motion.h1>
          </div>
          <nav className="flex items-center space-x-6">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {theme === 'dark' ? '🌞' : '🌙'}
            </motion.button>
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/about" className="hover:text-primary">About</Link>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"
            >
              Debug Your Code with AI
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8"
            >
              An intelligent code debugger that helps you find and fix issues in your code using advanced AI technology.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link href="/analyzer">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button size="lg" className="text-lg">
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover="hover"
                variants={cardVariants}
                className="p-6 rounded-lg bg-background border hover:shadow-xl transition-all duration-300"
              >
                <div className={`text-primary mb-4 bg-gradient-to-r ${feature.color} p-3 rounded-full w-12 h-12 flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.h2
              variants={itemVariants}
              className="text-3xl font-bold mb-4"
            >
              Ready to Debug Your Code?
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground mb-8"
            >
              Start using our AI-powered code debugger today and improve your coding experience.
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link href="/analyzer">
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button size="lg" className="text-lg">
                    Try It Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AI Code Debugger. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </motion.a>
              ))}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-muted-foreground hover:text-primary"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </motion.button>
                <AnimatePresence>
                  {showShareTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-background border rounded-lg text-sm whitespace-nowrap"
                    >
                      Copy URL to share
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 