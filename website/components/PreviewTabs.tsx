"use client";

import { useEffect, useState } from "react";
import {
  pageCopy,
  previewViews,
  type PreviewViewId
} from "@/lib/content";

const AUTO_ROTATE_MS = 4200;

export function PreviewTabs() {
  const [activeView, setActiveView] = useState<PreviewViewId>("source");
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      setAutoRotate(false);
      return;
    }

    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) {
        setAutoRotate(false);
      }
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!autoRotate) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveView((currentView) => {
        const currentIndex = previewViews.findIndex(
          (view) => view.id === currentView
        );
        const nextIndex = (currentIndex + 1) % previewViews.length;
        return previewViews[nextIndex]?.id ?? "source";
      });
    }, AUTO_ROTATE_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [autoRotate]);

  function handleSelect(viewId: PreviewViewId) {
    setAutoRotate(false);
    setActiveView(viewId);
  }

  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="preview-head">
        <div className="preview-title-group">
          <p className="preview-kicker">artifact preview</p>
          <h2 id="preview-title">Three views of one Claude export</h2>
          <p className="preview-caption">{pageCopy.previewCaption}</p>
        </div>

        <div className="view-switcher" role="tablist" aria-label="Preview modes">
          {previewViews.map((view) => {
            const isActive = activeView === view.id;

            return (
              <button
                key={view.id}
                className={`view-chip${isActive ? " is-active" : ""}`}
                id={`view-${view.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${view.id}`}
                onClick={() => {
                  handleSelect(view.id);
                }}
              >
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="preview-body">
        {previewViews.map((view) => {
          const isActive = activeView === view.id;

          return (
            <article
              key={view.id}
              className={`preview-panel${isActive ? " is-active" : ""}`}
              data-view-panel={view.id}
              id={`panel-${view.id}`}
              role="tabpanel"
              aria-labelledby={`view-${view.id}`}
              hidden={!isActive}
            >
              <div className="panel-tab">{view.panelLabel}</div>

              {view.kind === "archive" ? (
                <div className="drawer">
                  <div className="drawer-tree">
                    {view.treeLines?.map((line, index) => (
                      <p
                        key={`${line}-${index}`}
                        className={`tree-line${
                          index === 0
                            ? ""
                            : index === 1 || index === 2
                              ? " tree-indent-1"
                              : index === 3
                                ? " tree-indent-2"
                                : index === 4
                                  ? " tree-indent-3"
                                  : " tree-indent-4"
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>

                  <div className="drawer-slip">
                    <p className="slip-title">{view.slipTitle}</p>
                    <ul className="slip-list">
                      {view.slipList?.map((entry) => (
                        <li key={entry}>{entry}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <pre
                  className={view.kind === "paper" ? "paper-block" : "code-block"}
                >
                  <code>{view.code}</code>
                </pre>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
