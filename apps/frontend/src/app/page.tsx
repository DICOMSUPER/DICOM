"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  D
                </span>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                DICOM System
              </h1>
            </div>
            <Badge
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
            >
              AI-Integrated
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
            Advanced DICOM
            <span className="text-primary block">Image Management</span>
          </h2>
          <p className="text-xl text-foreground mb-8 max-w-2xl mx-auto">
            Streamline medical imaging workflows with AI-powered DICOM
            processing, secure storage, and intelligent analysis for healthcare
            professionals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="border-border">
              View Documentation
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-primary text-2xl">📊</span>
              </div>
              <CardTitle className="text-foreground">AI Analysis</CardTitle>
              <CardDescription>
                Advanced AI algorithms for medical image analysis and diagnosis
                assistance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-secondary text-2xl">🔒</span>
              </div>
              <CardTitle className="text-foreground">Secure Storage</CardTitle>
              <CardDescription>
                HIPAA-compliant storage with enterprise-grade security and
                encryption
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-accent text-2xl">⚡</span>
              </div>
              <CardTitle className="text-foreground">Fast Processing</CardTitle>
              <CardDescription>
                High-performance DICOM processing with real-time image rendering
              </CardDescription>
            </CardHeader>
          </Card>
        </section>

        {/* Stats Section */}
        <section className="bg-surface rounded-lg p-8 mb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-foreground">Images Processed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary mb-2">500+</div>
              <div className="text-foreground">Hospitals</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-2">99.9%</div>
              <div className="text-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-foreground">Support</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-border bg-card max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">
                Ready to Transform Your Medical Imaging?
              </CardTitle>
              <CardDescription className="text-lg">
                Join thousands of healthcare professionals who trust our DICOM
                system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  D
                </span>
              </div>
              <span className="text-foreground">
                © 2024 DICOM System. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
