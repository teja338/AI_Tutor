import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

import StarsBackground from "../../components/StarsBackground";
import RobotAvatar from "../../components/Robotavatar";
import BackButton from "../../components/BackButton";
const BASE_URL = "http://10.68.127.36:5000";

export default function TalkScreen() {

  const [messages, setMessages] = useState<{role:string,text:string}[]>([]);
  const [isTalking, setIsTalking] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  /* ---------------- SPEAK ---------------- */

  const speak = (text:string)=>{
    Speech.stop();
    Speech.speak(text,{
      language:"en",
      rate:0.9,
      pitch:1,
      onStart:()=>setIsTalking(true),
      onDone:()=>setIsTalking(false),
      onStopped:()=>setIsTalking(false),
      onError:()=>setIsTalking(false),
    });
  };

  /* ---------------- RECORD ---------------- */

  const startRecording = async ()=>{
    Speech.stop();

    const permission = await Audio.requestPermissionsAsync();
    if(!permission.granted) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS:true,
      playsInSilentModeIOS:true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    setRecording(recording);
    setIsRecording(true);
  };

  const stopRecording = async ()=>{
    if(!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();

    const uri = recording.getURI();
    setRecording(null);

    if(uri){
      const text = await speechToText(uri);
      if(text) sendMessage(text);
    }
  };

  /* ---------------- STT ---------------- */

  const speechToText = async(uri:string)=>{
    try{
      const formData = new FormData();
      formData.append("audio",{
        uri,
        name:"speech.m4a",
        type:"audio/m4a"
      } as any);

      const res = await fetch(`${BASE_URL}/api/speech/speech-to-text`,{
        method:"POST",
        body:formData
      });

      const data = await res.json();
      return data.text;
    }catch{
      return "";
    }
  };

  /* ---------------- CHAT ---------------- */

  const sendMessage = async(message:string)=>{
    setMessages(prev=>[...prev,{role:"user",text:message}]);

    const res = await fetch(`${BASE_URL}/api/chat/talk`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({message})
    });

    const data = await res.json();

    setMessages(prev=>[...prev,{role:"bot",text:data.reply}]);
    speak(data.reply);
  };

  /* ---------------- UI ---------------- */

  return(
    <LinearGradient colors={["#020617","#030712","#1e1b4b"]} style={styles.container}>
      <StarsBackground/>
      <BackButton />

      <View style={styles.robotArea}>
        <RobotAvatar width={260} height={240} isTalking={isTalking}/>
        <Text style={{color:"#cbd5e1",marginTop:10}}>Talk with your AI friend</Text>
      </View>

      <ScrollView style={styles.chatBox}>
        {messages.map((msg,i)=>(
          <View key={i} style={[
            styles.msg,
            msg.role==="user"?styles.user:styles.bot
          ]}>
            <Text style={{color:"white"}}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.micBtn,{backgroundColor:isRecording?"#ef4444":"#22c55e"}]}
        onPress={isRecording?stopRecording:startRecording}
      >
        <Ionicons name={isRecording?"stop":"mic"} size={28} color="white"/>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{flex:1,paddingTop:50},
  robotArea:{alignItems:"center",marginBottom:10},

  chatBox:{flex:1,padding:10},

  msg:{padding:10,borderRadius:12,marginVertical:6,maxWidth:"80%"},
  user:{backgroundColor:"#6366f1",alignSelf:"flex-end"},
  bot:{backgroundColor:"#334155",alignSelf:"flex-start"},

  micBtn:{
    position:"absolute",
    bottom:30,
    alignSelf:"center",
    width:70,
    height:70,
    borderRadius:40,
    alignItems:"center",
    justifyContent:"center"
  }
});
