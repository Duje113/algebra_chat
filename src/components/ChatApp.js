import React, { Component } from "react";

class ChatApp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentUserID: null,
      members: [],
      messages: [],
      inputValue: "",
    };

    this.drone = null;
  }

  componentDidMount() {
    // Initialize your Scaledrone connection here
    const drone = new window.Scaledrone("AZ7z8FlaczwkzUcB", {
      data: {
        name: this.getRandomName(),
      },
    });

    drone.on("open", (error) => {
      if (error) {
        return console.error(error);
      }
      console.log("Successfully connected to Scaledrone");

      this.setState({ currentUserID: drone.clientId });

      const room = drone.subscribe("observable-room");
      room.on("open", (error) => {
        if (error) {
          return console.error(error);
        }
        console.log("Successfully joined room");
      });

      room.on("members", (m) => {
        this.setState({ members: m });
        this.updateMembersDOM();
      });

      room.on("member_join", (member) => {
        console.log(`Member joined: ${member.id}`);
        const updatedMembers = [...this.state.members, member];
        this.setState({ members: updatedMembers });
        this.updateMembersDOM();
      });

      room.on("member_leave", ({ id, member }) => {
        console.log(`Member left: ${member.id}`);
        const updatedMembers = this.state.members.filter(
          (member) => member.id !== id
        );
        this.setState({ members: updatedMembers });
        this.updateMembersDOM();
      });

      room.on("data", (text, member) => {
        if (member) {
          console.log("Received message:", text);
          this.addMessageToListDOM(text, member);
        }
      });
    });

    drone.on("close", (event) => {
      console.log("Connection was closed", event);
    });

    drone.on("error", (error) => {
      console.error(error);
    });
  }

  componentWillUnmount() {
    if (this.drone) {
      const room = this.drone.subscribe("observable-room");
      room.unsubscribe();

      this.drone.off("open");
      this.drone.off("close");
      this.drone.off("error");

      this.drone.close();
    }
  }

  getRandomName() {
    const adjs = [
      "nice",
      "blue",
      "green",
      "red",
      "black",
      "smitten",
      "focused",
      "squirmy",
      "yellow",
      "pale",
      "dark",
      "happy",
      "sad",
      "ominous",
      "swollen",
      "bland",
      "viscous",
      "serendipitious",
      "silly",
      "angry",
      "amazing",
      "dire",
      "enormous",
      "hazy",
      "small",
      "jealous",
      "pristine",
      "moody",
      "gloomy",
      "swift",
      "warm",
      "icy",
      "smouldering",
      "vivacious",
      "handsome",
      "bright",
      "transparent",
      "gorgeous",
      "dangerous",
      "tricky",
      "lively",
      "smug",
      "sneaky",
      "shy",
      "spicy",
      "egregious",
      "royal",
      "manic",
    ];
    const nouns = [
      "hurricane",
      "river",
      "breeze",
      "moon",
      "rain",
      "wind",
      "sea",
      "morning",
      "snow",
      "lake",
      "sunset",
      "pine",
      "shadow",
      "leaf",
      "dawn",
      "glitter",
      "forest",
      "hill",
      "glacier",
      "cloud",
      "meadow",
      "sun",
      "glade",
      "bird",
      "brook",
      "butterfly",
      "daffodil",
      "bush",
      "dew",
      "dust",
      "field",
      "fire",
      "flower",
      "firefly",
      "feather",
      "grass",
      "haze",
      "mountain",
      "night",
      "pond",
      "darkness",
      "snowflake",
      "silence",
      "sound",
      "sky",
      "shape",
      "surf",
      "thunder",
      "violet",
      "water",
      "wildflower",
      "wave",
      "water",
      "resonance",
      "sun",
      "wood",
      "dream",
      "cherry",
      "tree",
      "fog",
      "frost",
      "voice",
      "paper",
      "frog",
      "smoke",
      "star",
      "lizard",
    ];

    return (
      adjs[Math.floor(Math.random() * adjs.length)] +
      " " +
      nouns[Math.floor(Math.random() * nouns.length)]
    );
  }

  sendMessage = () => {
    const { inputValue } = this.state;
    if (inputValue === "") {
      return;
    }

    this.setState({ inputValue: "" });

    // Publish the message using Scaledrone
    // const drone = new window.Scaledrone("AZ7z8FlaczwkzUcB");
    // drone.publish
    if (this.drone) {
      this.drone.publish({
        room: "observable-room",
        message: inputValue,
      });
    }
  };

  createMemberElement(member) {
    const { name } = member.clientData;
    return <div key={member.id}>{name}</div>;
  }

  updateMembersDOM() {
    const { members } = this.state;
    // Update the DOM with the list of members
    // You can map through 'members' and render them here
  }

  addMessageToListDOM(text, member) {
    const { messages } = this.state;
    const updatedMessages = [
      ...messages,
      {
        text,
        member,
      },
    ];
    this.setState({ messages: updatedMessages });
  }

  render() {
    const { inputValue, members } = this.state;

    return (
      <div className="app">
        <div className="members-count">{`${this.state.members.length} users in room:`}</div>
        <div className="members-list">
          {members.map((member) => this.createMemberElement(member))}
        </div>
        <div className="messages">
          {this.state.messages.map((message, index) => (
            <div key={index}>
              {this.createMemberElement(message.member)} {message.text}
            </div>
          ))}
        </div>
        <form
          className="message-form"
          onSubmit={(e) => {
            e.preventDefault();
            this.sendMessage();
          }}
        >
          <input
            className="message-form__input"
            placeholder="Type a message..."
            type="text"
            value={inputValue}
            onChange={(e) => this.setState({ inputValue: e.target.value })}
          />
          <input className="message-form__button" value="Send" type="submit" />
        </form>
      </div>
    );
  }
}

export default ChatApp;
