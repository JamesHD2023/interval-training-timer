import { useNavigate } from "react-router-dom";
import { Timer, Zap, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Interval Timer</h1>
          <p className="text-muted-foreground">Choose your training mode</p>
        </div>

        <div className="space-y-4">
          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 border-0"
            onClick={() => navigate("/japanese-walking")}
          >
            <div className="flex items-center space-x-4 text-white">
              <Timer className="w-12 h-12" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Japanese Walking</h2>
                <p className="text-blue-100 text-sm">5 × 3min intervals • 32 min total</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-orange-500 to-orange-600 border-0"
            onClick={() => navigate("/norwegian-4x4")}
          >
            <div className="flex items-center space-x-4 text-white">
              <Zap className="w-12 h-12" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Norwegian 4×4</h2>
                <p className="text-orange-100 text-sm">4 × 4min intervals • 43 min total</p>
              </div>
            </div>
          </Card>

          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-br from-purple-500 to-purple-600 border-0"
            onClick={() => navigate("/custom")}
          >
            <div className="flex items-center space-x-4 text-white">
              <Settings className="w-12 h-12" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">Custom Timer</h2>
                <p className="text-purple-100 text-sm">Create your own intervals</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
