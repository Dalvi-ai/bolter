"use client"
import React, { useContext, useEffect, useState } from 'react'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
} from "@codesandbox/sandpack-react";
import Lookup from '@/data/Lookup';
import axios from 'axios';
import { MessagesContext } from '@/context/MessagesContext';
import Prompt from '@/data/Prompt';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { Loader2Icon } from 'lucide-react';
import { countToken } from './ChatView';
import { UserDetailContext } from '@/context/UserDetailContext';
import SandpackPreviewClient from './SandpackPreviewClient';
import { ActionContext } from '@/context/ActionContext';
import { toast } from 'sonner';
import NetlifyDeploy from './NetlifyDeploy';
import GitHubIntegration from './GitHubIntegration';
import UIEditor from './UIEditor';

function CodeView() {
  const {id}=useParams();
  const {userDetail,setUserDetail}=useContext(UserDetailContext)
  const [activeTab,setActiveTab]=useState('code');
  const [files,setFiles]=useState(Lookup?.DEFAULT_FILE)
  const {messages,setMessages}=useContext(MessagesContext);
  const UpdateFiles=useMutation(api.workspace.UpdateFiles)
  const convex=useConvex();
  const [loading,setLoading]=useState(false);
  const UpdateTokens=useMutation(api.users.UpdateToken);
  const {action,setAction}=useContext(ActionContext);

  useEffect(()=>{
    id&&GetFiles();
  },[id])

  useEffect(()=>{
    action&&setActiveTab('preview');
  },[action])


  const GetFiles=async()=>{
    setLoading(true);
    const result=await convex.query(api.workspace.GetWorkspace,{
      workspaceId:id
    });
    const mergedFiles={...Lookup.DEFAULT_FILE,...result?.fileData}
    setFiles(mergedFiles);
    setLoading(false)
  }

  useEffect(()=>{
    if(messages?.length>0)
    {
        const role=messages[messages?.length-1].role;
        if(role=='user')
        {
            GenerateAiCode();
        } 
    }
},[messages])

  const GenerateAiCode=async()=>{
    setLoading(true)
    try{
    const PROMPT=JSON.stringify(messages)+" "+Prompt.CODE_GEN_PROMPT;
    const result=await axios.post('/api/gen-ai-code',{
      prompt:PROMPT
    });
    console.log(result.data);
    const aiResp=result.data;
    
    const mergedFiles={...Lookup.DEFAULT_FILE,...aiResp?.files}
    setFiles(mergedFiles);
    await UpdateFiles({
      workspaceId:id,
      files:aiResp?.files
    });

    const token=Number(userDetail?.token)-Number(countToken(JSON.stringify(aiResp)));
        //Update Tokens in Database 
        await UpdateTokens({
            userId:userDetail?._id,
            token:token
        })
        setUserDetail(prev=>({
          ...prev,
          token:token
         }))

    setActiveTab('code')
    setLoading(false);
        }
        catch(e)
        {
          toast("Server Side Error! Try Again")
          setLoading(false);
        }
  }

  const handleFilesUpdate = (updatedFiles) => {
    setFiles(updatedFiles);
    UpdateFiles({
      workspaceId: id,
      files: updatedFiles
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={GenerateAiCode}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate Code'}
          </button>
          <NetlifyDeploy files={files} />
          <GitHubIntegration files={files} />
        </div>
        <UIEditor files={files} onUpdateFiles={handleFilesUpdate} />
      </div>

      <div className="flex-1 overflow-auto">
        <SandpackProvider 
        files={files}
        template="react" theme={'dark'}
        customSetup={{
          dependencies:{
            ...Lookup.DEPENDANCY
          }
        }}
        options={{
          externalResources:['https://cdn.tailwindcss.com']
        }}
        >
          <SandpackLayout>
            {activeTab=='code'?<>
            <SandpackFileExplorer style={{ height: '80vh' }} />
            <SandpackCodeEditor style={{ height: '80vh' }} />
            </>:
            <>
            <SandpackPreviewClient/>
            </>}
           
          </SandpackLayout>
        </SandpackProvider>
      </div>

      {loading&&<div className='p-10 bg-gray-900 opacity-80
      absolute top-0 rounded-lg w-full h-full flex items-center justify-center'>
        <Loader2Icon className='animate-spin h-10 w-10 text-white'/>
        <h2 className='text-white'>Generating your files...</h2>
      </div>}
    </div>
  )
}

export default CodeView