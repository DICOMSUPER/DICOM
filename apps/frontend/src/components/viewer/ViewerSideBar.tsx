import React from "react";
import DicomImageLoader from "./DicomImageLoader";
import Link from "next/link";
import DicomThumbnail from "./DicomThumbnail";

export default function ViewerSideBar({
  isOpen,
  study,
  sameStudyInstances,
  renderingEngine,
  setRenderingEngine,
}: {
  isOpen: boolean;
  study: any;
  sameStudyInstances: any;
  renderingEngine: RenderingEngine | null;
  setRenderingEngine: (engine: RenderingEngine) => void;
}) {
  const returnThumbnail = (instance: any) => {
    const imageId = `wadouri:${(instance as any)?.file_path}`;
    return (
      <Link
        key={instance?.sop_instance_uid}
        href={`/viewer2?StudyInstanceUIDs=${instance?.sop_instance_uid}`}
      >
        <div className="flex flex-col justify-center items-center my-2 group relative px-2 py-1 bg-slate-700/50 rounded-lg border border-slate-600/50 hover:border-slate-500 transition-all duration-200 hover:bg-slate-700/80 cursor-pointer overflow-hidden">
          <DicomThumbnail
            imageId={imageId}
            viewportId={instance?.sop_instance_uid}
            width={80}
            height={80}
            renderingEngine={renderingEngine}
            setRenderingEngine={setRenderingEngine}
          />
          <h5 className="text-xs text-slate-300 mt-1 font-medium truncate group-hover:text-white transition-colors">
            {instance?.series?.study?.study_description}
          </h5>
        </div>
      </Link>
    );
  };

  return (
    <div
      className={`bg-slate-800 text-white transition-all duration-300 ${
        isOpen ? "w-64" : "w-0"
      } overflow-auto`}
    >
      {isOpen && study && (
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white leading-tight">
              {study.study_description}
            </h2>
            <div className="flex items-center mt-2 text-sm text-slate-300">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
              <time className="font-medium">{study.study_date}</time>
            </div>
          </div>

          {/* Content Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wide">
                OTHER DICOMS IN
                <br />
                THIS STUDY
              </h3>
              {sameStudyInstances && sameStudyInstances.length > 0 && (
                <span className="text-xs text-slate-300 font-medium">
                  {sameStudyInstances.length} instance
                  {sameStudyInstances.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {sameStudyInstances && sameStudyInstances.length > 0 ? (
                sameStudyInstances.map((instance: any) => {
                  return returnThumbnail(instance);
                })
              ) : (
                <div className="col-span-2">
                  <span className="italic font-medium text-sm text-slate-400">
                    This study does not have other instances
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
