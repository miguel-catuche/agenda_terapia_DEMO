import { Button } from "@/components/ui/button";
import { useHeaderTour } from "@/tour/useHeaderTour";
import Icon from "@/components/shared/Icons";

export default function TourButton() {
  const { startTour } = useHeaderTour();

    return (
        <Button
            className="w-full md:w-40 cursor-pointer bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-600 text-white rounded-xl font-extrabold shadow-lg hover:shadow-xl transition-all"
            onClick={startTour}
        >
            <Icon name="play" />
            INICIAR DEMO
        </Button>
    );
}
