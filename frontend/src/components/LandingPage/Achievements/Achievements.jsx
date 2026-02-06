import React from 'react';
import "./Achievements.css";
import AchievementCard from './AchievementCard';

const achievements = [
  {
    id: 1,
    title: (
      <>
         <span className="big-o">O</span>rganized <br />
            National Level <br />
            Coding <br />
            Competition:
      </>
    ),
    description: "Our ACM chapter successfully hosted a nationwide coding contest, attracting participants from top universities and encouraging competitive programming skills among students.",
    bgColor: "#0C4182"
  },
  {
    id: 2,
    title: (
      <>
         <span className="big-o">H</span>osted <br />
            Industry <br />
            Seminars & <br />
            Workshops:
      </>
    ),
    description: "We regularly organize seminars and workshops featuring industry professionals, providing students with insights into the latest technologies and career guidance.",
    bgColor: "#4A90E2B2"
  },
  {
    id: 3,
    title: (
      <>
         <span className="big-o">A</span>lumni <br />
            Success <br />
            Stories:
      </>
    ),
    description: "Our alumni have gone on to work at top tech companies worldwide, showcasing the strong foundation and networking opportunities provided by ACM CUI WAH.",
    bgColor: "#9BA0A4B2"
  }
];
const Achievements = () => {
  return (
    <div className="achievements-wrapper">
       
      <div className="container">
        <h1 className="title text-center mt-4">ACHIEVEMENTS</h1>

        <div className="row justify-content-center gx-4 gy-4 px-3 ">
          {achievements.map((a) => (

            <div className="col-12 col-md-4 col-lg-4 d-flex justify-content-center" key={a.id}>
              <AchievementCard
                number={a.id}
                title={a.title}
                description={a.description}
                bgColor={a.bgColor}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Achievements;