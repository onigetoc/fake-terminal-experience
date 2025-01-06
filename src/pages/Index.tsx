import Terminal from "@/components/Terminal/Terminal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <h1 className="text-4xl font-bold mb-4">Terminal Demo</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Try running some commands like "npm -v" or type "help" to see available commands.
        </p>
      </div>
      <Terminal />
    </div>
  );
};

export default Index;