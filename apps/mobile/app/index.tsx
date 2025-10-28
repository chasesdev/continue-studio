import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { LocalEngine } from '../src/providers/local-engine';
import { chatLMStudio } from '../src/providers/lmstudio';

export default function Home() {
  const [out, setOut] = useState('');
  const [prompt, setPrompt] = useState('Summarize this project.');
  async function runLocal() {
    setOut('');
    for await (const c of LocalEngine.chat([{ role: 'user', content: prompt }], { model: 'qwen-2.5-3b-q4' })) {
      setOut((s) => s + (c.token ?? ''));
    }
  }
  async function runMac() {
    setOut('');
    for await (const c of chatLMStudio('http://m4max:1234/v1', [{ role: 'user', content: prompt }], { model: 'qwen2.5:7b-instruct' })) {
      setOut((s) => s + (c.token ?? ''));
    }
  }
  return (
    <View className="flex-1 bg-black p-4 gap-4">
      <Text className="text-xl text-white font-semibold">Continue Studio (Mobile)</Text>
      <TextInput
        value={prompt}
        onChangeText={setPrompt}
        className="text-white bg-neutral-900 p-3 rounded"
        placeholderTextColor="#888"
      />
      <View className="flex-row gap-3">
        <Pressable onPress={runLocal} className="bg-emerald-600 px-3 py-2 rounded">
          <Text className="text-white">Edge (iPhone)</Text>
        </Pressable>
        <Pressable onPress={runMac} className="bg-sky-600 px-3 py-2 rounded">
          <Text className="text-white">M4 Max</Text>
        </Pressable>
      </View>
      <Text className="text-emerald-200">{out}</Text>
    </View>
  );
}