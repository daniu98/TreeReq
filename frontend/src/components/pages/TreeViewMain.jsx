import { useEffect } from "react";
import { Tree } from "../ui/Tree.jsx";
import { getTreeNodes } from "../../data/mockTrees.js";
import { getTreeDocumentTitle } from "../../lib/routes.js";

export default function TreeViewMain({ tree, onBack }) {
  useEffect(() => {
    if (tree) {
      document.title = getTreeDocumentTitle(tree);
    }
  }, [tree]);

  if (!tree) {
    return (
      <main className="tree-page tree-page--empty">
        <button type="button" className="tree-page__back" onClick={onBack}>
          ← Back to home
        </button>
        <p className="tree-page__empty-msg">Tree not found.</p>
      </main>
    );
  }

  return (
    <main className="tree-page" aria-labelledby="tree-page-title">
      <header className="tree-page__header">
        <button type="button" className="tree-page__back" onClick={onBack}>
          ← Back to home
        </button>

        <div className="tree-page__brand-row">
          <span className="tree-page__brand-mark" aria-hidden />
          <div className="tree-page__titles">
            <p className="tree-page__brand">TreeReq</p>
            <h1 id="tree-page-title" className="tree-page__title">
              {tree.name}
            </h1>
            {tree.major ? <p className="tree-page__major">{tree.major}</p> : null}
          </div>
        </div>
      </header>

      <section className="tree-page__canvas" aria-label={`${tree.name} degree tree`}>
        <Tree nodes={getTreeNodes(tree.id)} />
      </section>
    </main>
  );
}
