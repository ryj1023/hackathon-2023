import Image from "next/image";
import { useRef, useState } from "react";
import { api } from "~/utils/api";
import clsx from "clsx";

interface AvatarSelectorProps {
  type: "Hero" | "Villain";
  name: string;
  onSelect: (avatar: string) => void;
}

const colors = [
  "White",
  "Black",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Purple",
  "Orange",
];

const AvatarSelector = ({ type, name, onSelect }: AvatarSelectorProps) => {
  const avatars = api.images.list.useQuery();

  const imageGenerators = {
    Hero: api.images.newHero.useMutation(),
    Villain: api.images.newVillain.useMutation(),
  } satisfies Record<AvatarSelectorProps["type"], unknown>;

  const isLoading = imageGenerators[type].isLoading;

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [color, setColor] = useState<string>("White");
  const toggleRef = useRef<HTMLLabelElement>(null);

  const formId = `avatar-${type}`;

  const existingImages = avatars.data?.flatMap((avatar) => avatar.images) ?? [];

  const selectUrl = (url: string) => (e) => {
    setSelectedAvatar(url);
    onSelect(url);
    toggleRef.current?.click();
    e?.preventDefault();
    return url;
  };

  const handleGenerate = async () => {
    const [url] = await imageGenerators[type].mutateAsync({
      name,
      samples: 1,
      backgroundColor: color,
    });
    if (url) selectUrl(url);

    await avatars.refetch();
  };

  return (
    <div>
      <div className="my-1 flex flex-col">
        <div className="h-64 w-64 overflow-hidden rounded-t-lg border border-gray-500">
          {selectedAvatar ? (
            <Image
              src={selectedAvatar}
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
          Select {type} Avatar
        </label>
      </div>
      <input type="checkbox" id={formId} className="modal-toggle" />
      <label htmlFor={formId} className="modal cursor-pointer">
        <label className="modal-box relative w-11/12 max-w-5xl" htmlFor="">
          <div>
            <h2 className="text-xl">
              Generate New {type} for {name}
            </h2>
            <div className="form-control">
              <label className="label">
                <span>Background Color</span>
              </label>
              <select
                className="select-bordered select mb-2"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              >
                {colors.map((color) => (
                  <option key={color}>{color}</option>
                ))}
              </select>
              <button
                className={clsx("btn-primary btn", { loading: isLoading })}
                disabled={isLoading}
                onClick={() => void handleGenerate()}
              >
                Generate
              </button>
            </div>
          </div>
          <h3 className="text-xl">Existing Avatars:</h3>
          <div className="flex flex-row flex-wrap gap-3">
            {avatars.isLoading && <p>Loading...</p>}
            {existingImages.map((url) => (
              <button
                key={url}
                className="rounded border-4 border-transparent p-1 transition hover:border-primary hover:bg-gray-400"
                // onClick={selectUrl(url)}
                onClick={selectUrl(url)}
                disabled={isLoading}
              >
                <Image src={url} width={64} height={64} alt="avatar" />
              </button>
            ))}
          </div>
        </label>
      </label>
    </div>
  );
};

export default AvatarSelector;
