import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  MapPin,
  Scissors,
  Shield,
  Sparkles,
  Star,
  Wind,
} from "lucide-react";
import { motion } from "motion/react";
import { useGetServices } from "../hooks/useQueries";

const DEFAULT_SERVICES = [
  {
    id: 0,
    icon: Scissors,
    name: "Pet Grooming",
    description:
      "Complete grooming session including bath, brush-out, nail trimming, and ear cleaning.",
    duration: 60n,
    price: 1200n,
    color: "text-blue-500 bg-blue-50",
  },
  {
    id: 1,
    icon: Sparkles,
    name: "Premium Grooming",
    description:
      "Full spa treatment with premium shampoo, styling, haircut, and finishing touches.",
    duration: 90n,
    price: 2500n,
    color: "text-primary bg-primary/10",
  },
  {
    id: 2,
    icon: Shield,
    name: "Anti-Tick Treatment",
    description:
      "Specialized anti-tick and anti-flea treatment to keep your pet safe and itch-free.",
    duration: 30n,
    price: 700n,
    color: "text-orange-500 bg-orange-50",
  },
  {
    id: 3,
    icon: Wind,
    name: "De-Shedding Cure",
    description:
      "Professional de-shedding treatment to reduce loose fur and keep your home clean.",
    duration: 45n,
    price: 1199n,
    color: "text-purple-500 bg-purple-50",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    icon: Calendar,
    title: "Book Online",
    desc: "Choose your service, pick a date and time that suits you.",
  },
  {
    step: "2",
    icon: MapPin,
    title: "We Come to You",
    desc: "Our certified groomer arrives at your doorstep with all equipment.",
  },
  {
    step: "3",
    icon: Star,
    title: "Happy Pet!",
    desc: "Your pet gets pampered at home — no travel stress, just pure comfort.",
  },
];

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const { data: backendServices } = useGetServices();

  const displayServices =
    backendServices && backendServices.length > 0
      ? backendServices.map((s, i) => ({
          id: i,
          icon: DEFAULT_SERVICES[i % DEFAULT_SERVICES.length].icon,
          name: s.name,
          description: s.description,
          duration: s.duration,
          price: s.price,
          color: DEFAULT_SERVICES[i % DEFAULT_SERVICES.length].color,
        }))
      : DEFAULT_SERVICES;

  return (
    <main className="doodle-bg">
      {/* Hero */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 rounded-full text-sm font-medium">
              🐾 Doorstep Grooming Service
            </Badge>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
              Professional Doorstep{" "}
              <span className="text-primary">Pet Grooming</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              Give your furry family member the spa day they deserve — right at
              home. Certified groomers, premium products, zero travel stress.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => onNavigate("booking")}
                data-ocid="hero.primary_button"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8 py-6 text-base font-semibold shadow-lg"
              >
                Start Booking
              </Button>
              <Button
                variant="outline"
                onClick={() => onNavigate("services")}
                data-ocid="hero.secondary_button"
                className="rounded-full px-8 py-6 text-base border-primary/30 text-primary hover:bg-primary/5"
              >
                View Services
              </Button>
            </div>
            <div className="flex items-center gap-6 pt-2">
              {["500+ Happy Pets", "5★ Rated", "Same Day Booking"].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-0 bg-primary/20 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] blur-2xl" />
              <img
                src="/assets/generated/hero-groomer-dog.dim_800x700.jpg"
                alt="Professional groomer with happy dog"
                className="relative rounded-[60%_40%_55%_45%/50%_60%_40%_50%] object-cover w-full aspect-[4/3] shadow-2xl"
              />
              <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl shadow-card p-3 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm">
                    4.9 / 5 stars
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From 200+ reviews
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-card py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              Our Services
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From a quick freshen-up to a full spa day, we have everything your
              pet needs.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayServices.map((service, i) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card
                    className="h-full hover:shadow-card transition-shadow cursor-pointer group"
                    data-ocid={`services.item.${i + 1}`}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${service.color}`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-lg mb-1">
                          {service.name}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {service.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-muted-foreground text-xs">
                          {Number(service.duration)} min
                        </span>
                        <span className="font-heading font-bold text-primary text-lg">
                          ₹{Number(service.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 doodle-bg">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to a happy, clean pet.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center"
                >
                  <div className="relative inline-flex items-center justify-center mb-5">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-accent text-accent-foreground text-xs font-bold rounded-full flex items-center justify-center">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-lg mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => onNavigate("booking")}
              data-ocid="howitworks.primary_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold"
            >
              Book a Session Now
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
