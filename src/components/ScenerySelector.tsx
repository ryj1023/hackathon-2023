import Image from "next/image";
import { useRef, useState } from "react";
import { api } from "~/utils/api";
import clsx from "clsx";

interface ScenerySelectorProps {
  label: string;
  onSelect: (scenery: string) => void;
}

const ScenerySelector = ({ label, onSelect }: ScenerySelectorProps) => {
  const scenery = api.images.listScenery.useQuery();
  const sceneryGenerator = api.images.newScenery.useMutation();

  const isLoading = sceneryGenerator.isLoading;

  const [selectedScenery, setSelectedScenery] = useState<string | null>(null);
  const toggleRef = useRef<HTMLLabelElement>(null);

  const formId = `scenery`;

  const existingImages = scenery.data ?? [];

  const selectUrl = (url: string) => (e) => {
    setSelectedScenery(url);
    onSelect(url);
    toggleRef.current?.click();
    e?.preventDefault();
    return url;
  };

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const [url] = await sceneryGenerator.mutateAsync({
      label,
    });

    if (url) selectUrl(url)(e);
    await scenery.refetch();
  };

  return (
    <div>
      <div className="my-1 flex flex-col">
        <div className="h-64 w-64 overflow-hidden rounded-t-lg border border-gray-500">
          {selectedScenery ? (
            <Image
              src={selectedScenery}
              width={256}
              height={256}
              alt="selected avatar"
            />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center text-9xl text-gray-500">
              ?
            </div>
          )}
        </div>
        <label
          htmlFor={formId}
          className="btn-primary btn-xs btn w-64 rounded-t-none"
          ref={toggleRef}
        >
          Select Scenery
        </label>
      </div>
      <input type="checkbox" id={formId} className="modal-toggle" />
      <label htmlFor={formId} className="modal cursor-pointer">
        <label className="modal-box relative w-11/12 max-w-5xl" htmlFor="">
          <div>
            <h2 className="text-xl">Generate New Scenery for {label}</h2>
            <div className="flex flex-row gap-3">
              <button
                className={clsx("btn-primary btn", { loading: isLoading })}
                disabled={isLoading}
                onClick={(e) => void handleGenerate(e)}
              >
                Generate
              </button>
            </div>
          </div>
          <h3 className="text-xl">Existing Scenery:</h3>
          <div className="flex flex-row flex-wrap gap-3">
            {scenery.isLoading && <p>Loading...</p>}
            {existingImages.map((url) => (
              <button
                key={url}
                className="rounded border-4 border-transparent p-1 transition hover:border-primary hover:bg-gray-400"
                onClick={selectUrl(url)}
                disabled={isLoading}
              >
                <Image src={url} width={256} height={256} alt="scenery" />
              </button>
            ))}
          </div>
        </label>
      </label>
    </div>
  );
};

export default ScenerySelector;
