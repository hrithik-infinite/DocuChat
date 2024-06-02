import React from "react";
import { Button } from "../ui/button";
import axios from "axios";

const Messages = () => {
  const msgHandle = async () => {
    const file = await axios.get(`/api/getFileUploadStatus?id=clwwchk1r0001hsv208wry58`);
    console.log(file.data.uploadStatus);
  };
  return (
    <div>
      <Button onClick={msgHandle}>API Call</Button>
    </div>
  );
};

export default Messages;
