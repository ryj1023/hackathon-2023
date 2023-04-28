import Image from "next/image";
import { useRef, useState } from "react";
import { api } from "~/utils/api";
import clsx from 'clsx';

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

  const selectUrl = (url: string) => () => {
    console.log('selecting', url)
    setSelectedScenery(url);
    onSelect(url);
    console.log(toggleRef.current)
    toggleRef.current?.click();
  }

  const handleGenerate = async () => {
    const [url] = await sceneryGenerator.mutateAsync({
      label,
    });

    console.log('generated', url)

    if (url) selectUrl(url)();
    await scenery.refetch();
  };

  return (
    <div>
      <div className="flex flex-col my-1">
        <div className="border border-gray-500 rounded-t-lg h-64 w-64 overflow-hidden">
          {selectedScenery
            ? <Image src={selectedScenery} width={256} height={256} alt="selected avatar" />
            : <div className="text-gray-500 text-9xl h-64 w-64 flex items-center justify-center">?</div>}
        </div>
        <label
          htmlFor={formId}
          className="btn btn-xs btn-primary w-64 rounded-t-none"
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
                className={clsx('btn btn-primary', { loading: isLoading })}
                disabled={isLoading}
                onClick={() => void handleGenerate()}
              >
                Generate
              </button>
            </div>
          </div>
          <h3 className="text-xl">Existing Scenery:</h3>
          <div className="flex flex-row flex-wrap gap-3">
            {scenery.isLoading && <p>Loading...</p>}
            {existingImages.map(url => (
              <button
                key={url}
                className="p-1 border-4 border-transparent rounded transition hover:bg-gray-400 hover:border-primary"
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
  )
}

export default ScenerySelector;