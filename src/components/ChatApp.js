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
    this.drone = new window.Scaledrone("AZ7z8FlaczwkzUcB", {
      data: {
        name: this.getRandomName(),
      },
    });

    this.drone.on("open", (error) => {
      if (error) {
        return console.error(error);
      }
      console.log("Successfully connected to Scaledrone");

      this.setState({ currentUserID: this.drone.clientId });

      const room = this.drone.subscribe("observable-room");
      room.on("open", (error) => {
        if (error) {
          return console.error(error);
        }
        console.log("Successfully joined room");
      });

      room.on("members", (m) => {
        this.setState({ members: m });
      });

      room.on("member_join", (member) => {
        console.log(`Member joined: ${member.id}`);
        const updatedMembers = [...this.state.members, member];
        this.setState({ members: updatedMembers });
      });

      room.on("member_leave", ({ id }) => {
        const updatedMembers = this.state.members.filter(
          (member) => member.id !== id
        );
        this.setState({ members: updatedMembers });
      });

      room.on("data", (text, member) => {
        if (member) {
          console.log("Received message:", text);
          this.addMessageToList(text, member);
        }
      });
    });

    this.drone.on("close", (event) => {
      console.log("Connection was closed", event);
    });

    this.drone.on("error", (error) => {
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
      "nice",
      "blue",
      "green",
      "happy",
      "sad",
      "ominous",
      "gloomy",
      "swift",
      "warm",
      "red",
      "black",
      "smitten",
      "focused",
      "squirmy",
      "yellow",
      "pale",
      "dark",
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
      "extatic",
      "thrilled",
    ];
    const nouns = [
      "hurricane",
      "mole",
      "platypus",
      "silence",
      "sound",
      "turtle",
      "cat",
      "shape",
      "forest",
      "banshee",
      "hill",
      "glacier",
      "penguin",
      "meadow",
      "sun",
      "glade",
      "bird",
      "ostrich",
      "butterfly",
      "daffodil",
      "bush",
      "dew",
      "dust",
      "field",
      "fire",
      "zebra",
      "firefly",
      "cucumber",
      "surf",
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
      "grass",
      "haze",
      "mountain",
      "night",
      "pond",
      "darkness",
      "snowflake",
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

    if (this.drone) {
      this.drone.publish({
        room: "observable-room",
        message: inputValue,
      });
    }
  };

  createMemberElement(member) {
    const { name } = member.clientData;
    return (
      <div key={member.id} className="member">
        {name}
      </div>
    );
  }

  addMessageToList(text, member) {
    const { messages } = this.state;
    const updatedMessages = [
      ...messages,
      {
        text,
        member,
      },
    ];

    this.setState({ messages: updatedMessages }, () => {
      if (this.messagesContainer) {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      }
    });
  }

  render() {
    const { inputValue, members } = this.state;
    const currentUserID = this.state.currentUserID;

    return (
      <div className="app">
        <div className="members-count">{`${this.state.members.length} users in room:`}</div>
        <div className="members-list">
          {members.map((member) => this.createMemberElement(member))}
        </div>
        <div className="messages" ref={(el) => (this.messagesContainer = el)}>
          {this.state.messages.map((message, index) => (
            <div
              key={index}
              className={`message ${
                message.member.id === currentUserID
                  ? "message-left"
                  : "message-right"
              }`}
            >
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
