<a id="readme-top"></a>

<!-- [![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url] -->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/konradloch/PromptArk">
    <img src="images/logowhite.png" alt="Logo" width="400" height="125">
  </a>

<!-- <h3 align="center">PromptArk</h3> -->

  <p align="center">
    Build, store, analyze and get feedbacks of your LLM prompts and outputs used in your services. Just a tool for prompt engineering in sofware engineering.
    <br />
    <a href="https://github.com/konradloch/PromptArk/wiki/Welcome-to-the-PromptArk-wiki!"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/konradloch/PromptArk/wiki/Welcome-to-the-PromptArk-wiki!">View docs</a>
    ·
    <a href="https://github.com/konradloch/PromptArk/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/konradloch/PromptArk/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
  <b align="center">
  The current version of the service is not suitable for production use!
  </b>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

<img src="images/appscreenshot1.png" alt="AppScreen">

The project was created through the need for dynamic prompt management in applications using LLM. Then evolved to a small platform where prompts are handled from creation to user feedback.

### Features
- 💾 <b>Prompt Store </b> provides a suitable place to store the prompts. This solution eliminates the need to keep your prompts directly in the code.

- ▶️ <b>Prompt Flow Builder </b> helps to organize and graphically represent the process in which we use more than one LLM call to produce a final result.

- 👷 <b>Prompt Builder</b> allows you to work with prompts. Build prompts using best practices, create new versions and manage them dynamically in your application.

- 👀 <b> Prompt Analyzer </b> allows you to view the results of the promts and evaluate their effectiveness.

- 👍  <b> Prompt Feedback </b> shows the effectivity of prompts. Ratings can be collected in a variety of ways. Starting from feedback from prompt engineers, and ending with end users.

- ↔️ <b> Prompt A/B Tests </b> help in choosing the best prompt version that works in all situations.


### Main concepts
<img src="images/diag.png" alt="diagram">

- LLM calls are made on client side. PromptArk does't trigger LLM directly, it focus only on prompts.
- Clients comunicate via PromptArk API or SDK.

### The application may be usefull if you:
- Need to dynamically manage prompts within your application.
- Create and test prompts, especially those linked in a sequence.
- Require feedback on prompt results.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* [![Go][Go]][Go-url]
* [![React][React.js]][React-url]
* [![MongoDB][MongoDB]][MongoDB-url]
* [![Docker][Docker]][Docker-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- GETTING STARTED -->
## Getting Started

This is an example of how you may give instructions on setting up your project locally.
To get a local copy up and running follow these simple example steps.
### Docker
#### Prerequisites
* Docker
* Docker Compose
#### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/konradloch/PromptArk.git
   ```
1. Open `deployment` folder
   ```sh
   cd ./deployment
   ```
1. Run containers
   ```sh
   docker-compose up -d --build
   ```
1. Open in browser 
   ```sh
   http://localhost:3000
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

How to use PromptArk in few points:

 1. Create a group. Group represents a chain of prompts or just single prompt that you will use in LLM in your application. You create group in the “Group” page.
 2. Open the created group and create a chain of prompts or just individual prompts. In creation form you will find explanations of various fields.
 3. With the prompt created, click the button referring to the builder.
 4. It is time to create a prompt. The question marks next to the field names will provide useful information. Remember to save it. This will create a new version to which you will always be able to return.
 5. Repeat building process for all created prompts and activate desired prompts version via the “Activate” button.
 6. In order to have access to your prompts through the API or SDK, you must make the group public ("by clicking the ‘Publish’ button). Publication allows to manage "production" prompts.
 7. From now on you can fetch, manage, record results, create A/B tests and collect feedback from your prompts and their results via API or SDK. You can find how to do this in the references to Swagger UI by the names of the modules.

_For more examples, please refer to the [Documentation](https://github.com/konradloch/PromptArk/wiki/Welcome-to-the-PromptArk-wiki!)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- ROADMAP -->
## Roadmap

- [ ] SDK for Java, Go and Python
- [ ] Improve reliability, avaliability and performance of API calls.
- [ ] Improve analyzer UI
    - [ ] graph view for group of prompts
    - [ ] A/B test prompts arena (for picking better prompts results)
    - [ ] better view to compare multiple prompts versions
- [ ] External module to run prompts against multiple LLM models
- [ ] LLM-as-a-judge integrated with analyzer
- [ ] Exporter for rated prompts (for fine-tunning purposes)
- [ ] Improved prompt builder
  - [ ] better builder
  - [ ] prompt auto-tune
- [ ] Notifier for failed prompts
- [ ] Improved feedback section (more details)
- [ ] Improved metrics section.
- [ ] User Management
- [ ] Improved Security
- [ ] Improve scoring system
- [ ] Add Multiple tokenizers

See the [open issues](https://github.com/konradloch/PromptArk/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ### Top contributors:

<a href="https://github.com/konradloch/PromptArk/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=github_username/repo_name" alt="contrib.rocks image" />
</a> -->

<!-- LICENSE -->
## License

Distributed under the AGPL-3.0 license. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
<!-- ## Contact

Your Name - [@twitter_handle](https://twitter.com/twitter_handle) - email@email_client.com

Project Link: [https://github.com/konradloch/PromptArk](https://github.com/konradloch/PromptArk)

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->



<!-- ACKNOWLEDGMENTS
## Acknowledgments

* []()
* []()
* []()

<p align="right">(<a href="#readme-top">back to top</a>)</p> -->



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
<!-- [contributors-shield]: https://img.shields.io/github/contributors/github_username/repo_name.svg?style=for-the-badge
[contributors-url]: https://github.com/konradloch/PromptArk/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/github_username/repo_name.svg?style=for-the-badge
[forks-url]: https://github.com/konradloch/PromptArk/network/members
[stars-shield]: https://img.shields.io/github/stars/github_username/repo_name.svg?style=for-the-badge
[stars-url]: https://github.com/konradloch/PromptArk/stargazers
[issues-shield]: https://img.shields.io/github/issues/github_username/repo_name.svg?style=for-the-badge
[issues-url]: https://github.com/konradloch/PromptArk/issues
[license-shield]: https://img.shields.io/github/license/github_username/repo_name.svg?style=for-the-badge
[license-url]: https://github.com/konradloch/PromptArk/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: images/screenshot.png -->
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Go]: https://img.shields.io/badge/Go-20232A?style=for-the-badge&logo=go&logoColor=00ADD8
[Go-url]: https://go.dev/
[MongoDB]: https://img.shields.io/badge/MongoDB-20232A?style=for-the-badge&logo=mongodb&logoColor=47A248
[MongoDB-url]: https://www.mongodb.com/
[Docker]: https://img.shields.io/badge/Docker-20232A?style=for-the-badge&logo=docker&logoColor=2496ED
[Docker-url]: https://www.docker.com/