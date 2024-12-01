# prompt-analyzer

## Zalozenia

- Graph View sluzy tylko do pogladu flow promtow. Pomocne dla promnt engineera, devopsa oraz SWE.
- Prompt builder sluzy do tworzenia promptow i do wersjonowania. Jest tak zaprojektowany aby wspomagać budowę promtów.
Posiada podpowiedzi z najlepszymi praktykami dotyczacych promptów.
- 

## TODO

  - params in publication [X]
  - better analyzer view (add error handling / status message in Monitor and etc...) [X]
  - group view in analyzer, and color status (grouo id, start, end duration, correlation id (grouped), status) [X]
  <!-- - graph view in analyzer and style table [Premium version or to WIP] TODO -->
  - feedback filter [X]
  - feedback, create nested table with groups and subprompts. [computed, added by user.]  [X]
  - add A/B testing in pubication [X]
    - add full result in analyzer [X]
    - add filter by publication in analyzer [X]
  - helpers [X]
  - Open API [X]
  - Ready to use links in publications [X]
  - Statistics [X]
  - add production configuration [X?]
  - minors like delete, etc...
  - add like and dislike to analyzer 
  - websockets
  - optional codeilum [X]
  - prepare to open source simple version
    - README
      - deplouemnt
      - license
      - logo
      - desriptions
      - video
    - marketing
    - fixes in code [C]
      - Fronted [X]
      - backend
    - simple website
  - prepare to cloud version
    - Add inforation on website on comming cloud version with special features.
  - automated tests
---

- add A/B testing panel with comparator to select the best answer (group based at first stage)
  - consider autollm to pick best answer
- add AUTOLLM feedbacker (user should specyify prompt to verify if outout is positive or negative )?
- generate LLM output metrics
- bad metrics notifier

  --- https://www.codesmith.io/blog/an-introduction-to-llm-evaluation-how-to-measure-the-quality-of-llms-prompts-and-outputs
  - Add feedback buttons in analyzer (for human eval)
    - yes/no
    - Score
    - A/B testing button if in A/B Testing
  - Add AUTO LLM feedback
    - comapre Better answer in A/B Tests
    - Test LLM to generate Prompt and Output Score Metrics:
      - Toxicity
      - Halucination
      - Versatility
      - Efficiency
      - Relevance
      - Grounding
    - Select refereneces outputs and evaluate prompt on that
  - Improve feedbacks (split into human user/ llm/ client sections and avarege of all that)
    - More scoring
    - A/B prompts comaprator
  - User defined evals (eg. using go simple funct takes string resturns int or bool)
  - For given feedback run Prompt improver that will improve prompt in worst asspects of feedback
  ---

  - main page with promtps information
    - how to start
    - prompt engineering from roadmap.sh (https://roadmap.sh/prompt-engineering)
      - techniques
      - pitfals
      - injecting
      - reliability
      - parameters
    <!-- - news.
      - releases 
      - new LLMs
      - new trchniques
      - new papers -->
  - LLAMA verifier for feedback or analyzer?
    - suggestion which techniques might be profitable
    - overall prompt output score
    - feedback (possitivie or not)
  - api token
  - users
  - landing page (https://github.com/mirislomovmirjalol/Saas-landing-page?tab=readme-ov-file)
  - marketing 
  - beta test
  - users feedback


# Created for
- help with task decomposition
- proper prompts builder
- prompts versioning
- prompts testing (includes A/B testing)
- prompts analysis
- prompt chainging
- prompt injections

# Features

## Prompt Builder
- Prompt builder enforces you to use the best practices for building prompts. It will help you to build prompts that are more engaging and effective.

## Prompt Flow builder
- Prompt flow builder helps you to build a flow of prompts. It will help you to build a flow to achieve specific goals.

## Prompt store
- Instead of defining prompts directly in code you can define prompts in a store. It gives you the flexibility to change prompts without changing the code.
- You can quickly react on the feedback and change the prompts.
- You can create A/B tests to improve your system.

## Prompt analyzer
- Observability is key to understand how your prompts are performing. Prompt analyzer helps you to analyze the performance of your prompts.
- Verify Input/Outptus
- Internal tool to verify correctnes of results.
- [In progress] Helps in A/B testing.
- [IN PROGRESS] Verify performance measurements
- [IN PROGRESS] Notifications

## Prompt Feedback
- Tool to collect feedback from users about the prompts versions. It will help you to improve the prompts.
- Helps in A/B testing.

## Prompt publisher
- Separetes your prompt Lab from production releases.
- Helps in A/B testing.
- Provides statistics about the prompts.
-
## Security
## Generic
## Availability
## Maintainability
## Support

## SDK (soon)

# https://editor.swagger.io/

## TODO List
- Better A/B test results comparator
- Langchain libs support
- Pydanic lib like support
- Function support
- Vector databases support
- Image generation support
- Video generation support
- ReAct support
- Objective metrics: Develop quantitative measures that determine the quality of a response. Examples include accuracy, precision, recall, and F1 scores. These metrics can be used as part of the AI model’s assessment process, offering a consistent way to gauge its performance.
- Confidence levels: Implement a system that measures the AI model’s confidence in its responses. A confidence score can help users understand the reliability of a response, and it can also help the AI model refine its behavior when it has uncertainty. Make sure the confidence score is calculated based on factors such as data quality, algorithm performance, and historical accuracy.