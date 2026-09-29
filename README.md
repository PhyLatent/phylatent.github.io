# PhyLatent

Project website for **PhyLatent: Learning Dynamics-Relevant Representations for JEPA World Models**.

[Project website](https://phylatent.github.io/) · [Read the paper](https://arxiv.org/abs/2608.05720) · [Code](https://github.com/Cherishings/PhyLatent) · [Models & checkpoints](https://github.com/Cherishings/PhyLatent#pretrained-checkpoints-and-planning) · [Download BibTeX](phylatent.bib)

This repository contains the static paper website. It uses HTML, CSS, and JavaScript, with figures and video demonstrations stored locally and links to the paper and official research repository. No build step, package installation, or backend is required.

## Website content

- A prominent four-task planning demonstration for Cube, TwoRooms, Reacher, and PushT.
- The method overview and scatter plots illustrating three forms of representation collapse.
- Separate video demonstrations of physical invariance, physical distinguishability, and counterfactual dynamics collapse.
- Nine consistently formatted experimental tables, with explanatory captions below each table.
- Appearance robustness and goal separation results, individual task videos, and citation resources.

Tables are reformatted for readability while preserving the reported values and their corresponding methods, tasks, and conditions. Figures and demonstrations retain the scientific meaning of the source material.

## Source code and model availability

The website links directly to the official research repository, [Cherishings/PhyLatent](https://github.com/Cherishings/PhyLatent), for training configurations, planning and evaluation code, collapse diagnostics, documentation, and license notices.

The Models buttons link to the repository's [pretrained checkpoints and planning](https://github.com/Cherishings/PhyLatent#pretrained-checkpoints-and-planning) section. Refer to that repository for checkpoint availability and usage instructions. The website does not host a separate source archive or model weights. Visitors can access the repository once its owner makes it public.

## Deploy with GitHub Pages

1. Keep `index.html`, `.nojekyll`, and all accompanying image and video files at the repository root.
2. Push the website files to the `main` branch.
3. In **Settings → Pages**, select **Deploy from a branch**.
4. Select **main** and **/(root)**, then save.

For the `PhyLatent/phylatent.github.io` repository, GitHub Pages serves the website at `https://phylatent.github.io/` after deployment completes. Confirm the deployment status and published address in the repository's Pages settings.

Local assets use relative URLs, so the site supports both organization root sites and GitHub Pages project paths. The `.nojekyll` file allows the files to be served directly without Jekyll processing.

## Preview and maintenance

Serve this directory with any static HTTP server and open its local address in a browser.

| File or directory | Purpose |
| --- | --- |
| `index.html` | Paper information, scientific content, tables, and resource links |
| `styles.css` | General styles and the opening sections |
| `sections.css` | Diagnostics, results, resources, and responsive layouts |
| `app.js` | Video behavior, section navigation, and citation copying |
| `*.png`, `*.svg`, `*.jpg` | Figures and video preview images |
| `*.mp4` | Task demonstrations and collapse diagnostics |
| `phylatent.bib` | Downloadable paper citation |

When updating experimental results, preserve the mapping between each value and its method, task, metric, and evaluation condition. Keep captions with their associated tables and figures. Maintain the paper, source, and model resource links together when their destinations change.
