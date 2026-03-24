import { useState } from "react";
import { Shield, MapPin, Video, Wifi } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const AddCamera = () => {
  const [url, setUrl] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [isLive, setIsLive] = useState(true);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare Form Data for Django's request.POST.get()
    const formData = new FormData();
    formData.append("live_feed_url", url);
    formData.append("latitude", lat);
    formData.append("longitude", lng);
    // Note: The current backend create_camera doesn't store 'isLive', 
    // but you can pass it if you update your Django model.

    try {
      const response = await fetch("http://localhost:8000/camera/create/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Camera Added",
          description: "The new camera feed has been registered successfully.",
        });
        setUrl(""); setLat(""); setLng("");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to add camera.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not reach the backend server.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <Card className="w-full max-w-md border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Register New Camera</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">Add a YouTube stream for AI road monitoring.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <Input 
                id="url" 
                placeholder="https://www.youtube.com/watch?v=..." 
                value={url} 
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lat">Latitude</Label>
                <Input 
                  id="lat" 
                  placeholder="e.g. 28.6139" 
                  value={lat} 
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lng">Longitude</Label>
                <Input 
                  id="lng" 
                  placeholder="e.g. 77.2090" 
                  value={lng} 
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/20">
              <div className="flex items-center gap-2">
                <Wifi className={`w-4 h-4 ${isLive ? "text-success" : "text-muted-foreground"}`} />
                <Label htmlFor="live-status" className="cursor-pointer">Stream is Live</Label>
              </div>
              <Switch 
                id="live-status" 
                checked={isLive} 
                onCheckedChange={setIsLive} 
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              Add Camera to Grid
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCamera;