'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, Dataset, SavedPersona, LLMExperimentConfig } from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ArrowLeft, Database, User, MessageSquare, Plus, Edit2, Trash2, GripVertical, Save, Play } from 'lucide-react';

type TabType = 'dataset' | 'persona' | 'conversation';
type BlockType = 'predefined' | 'simulated' | 'initial';
type MessageRole = 'system' | 'assistant' | 'user';

interface Persona {
  id: string;
  name: string;
  systemMessage: string;
}

interface ConversationBlock {
  id: string;
  type: BlockType;
  column: 1 | 2 | 'both'; // 'both' for simulated conversation blocks
  turnNumber: number;
  content?: string; // for predefined responses and initial message
  rounds?: number; // for simulated conversation
  messageRole?: MessageRole; // for initial message and predefined responses
}

function LLMLLMSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const experimentName = searchParams.get('name') || 'Untitled Experiment';
  
  const [activeTab, setActiveTab] = useState<TabType>('dataset');
  const [editMode, setEditMode] = useState(false);
  const [editingExperimentName, setEditingExperimentName] = useState('');
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Persona state
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  const [personaName, setPersonaName] = useState('');

  // Conversation state
  const [column1Persona, setColumn1Persona] = useState<string>('');
  const [column2Persona, setColumn2Persona] = useState<string>('');
  const [firstToSpeak, setFirstToSpeak] = useState<1 | 2>(1); // 1 for column1, 2 for column2
  const [initialMessage, setInitialMessage] = useState('');
  const [initialMessageRole, setInitialMessageRole] = useState<MessageRole>('user');
  const [conversationBlocks, setConversationBlocks] = useState<ConversationBlock[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [draggedBlock, setDraggedBlock] = useState<ConversationBlock | null>(null);
  const [savedPersonas, setSavedPersonas] = useState<SavedPersona[]>([]);
  const [saving, setSaving] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);

  useEffect(() => {
    loadExperimentData();
    loadSavedPersonas();
  }, []);

  useEffect(() => {
    // Check if we're in edit mode
    if (editId) {
      loadExistingExperiment(parseInt(editId));
    }
  }, [editId]);

  const loadExistingExperiment = async (id: number) => {
    try {
      setLoading(true);
      const experiment = await api.getExperiment(id);
      
      if (experiment.experiment_type !== 'llm-llm') {
        alert('Invalid experiment type');
        router.push('/dashboard/experiments');
        return;
      }

      setEditMode(true);
      setEditingExperimentName(experiment.name);

      // Load dataset
      const datasetData = await api.getDataset(experiment.dataset_id);
      setDataset(datasetData);

      const config = experiment.config as LLMExperimentConfig;

      // Load personas from the config
      const loadedPersonas: Persona[] = config.personas.map((p, idx) => ({
        id: `persona-${Date.now()}-${idx}`,
        name: p.name,
        systemMessage: p.systemMessage
      }));
      setPersonas(loadedPersonas);

      // Set persona IDs
      const persona1 = loadedPersonas.find(p => {
        const savedP = config.personas.find(cp => cp.name === p.name);
        return savedP?.name === config.personas[0]?.name;
      });
      const persona2 = loadedPersonas.find(p => {
        const savedP = config.personas.find(cp => cp.name === p.name);
        return savedP?.name === config.personas[1]?.name;
      });
      
      if (persona1) setColumn1Persona(persona1.id);
      if (persona2) setColumn2Persona(persona2.id);

      // Load conversation setup
      setFirstToSpeak(config.conversation_setup.first_to_speak);
      setInitialMessage(config.conversation_setup.initial_message);
      setInitialMessageRole(config.conversation_setup.initial_message_role);

      // Load conversation blocks
      const blocks: ConversationBlock[] = config.conversation_setup.blocks.map((block: any, idx: number) => {
        if (block.type === 'predefined') {
          return {
            id: `block-${idx}`,
            type: 'predefined',
            column: block.column,
            turnNumber: block.turn_number,
            content: block.content,
            messageRole: block.message_role
          };
        } else {
          return {
            id: `block-${idx}`,
            type: 'simulated',
            column: 'both',
            turnNumber: block.turn_number,
            rounds: block.rounds
          };
        }
      });
      setConversationBlocks(blocks);

      setLoading(false);
    } catch (err) {
      console.error('Failed to load experiment:', err);
      alert('Failed to load experiment');
      router.push('/dashboard/experiments');
    }
  };

  const loadSavedPersonas = async () => {
    try {
      const data = await api.listSavedPersonas();
      setSavedPersonas(data);
    } catch (err) {
      console.error('Failed to load saved personas:', err);
    }
  };

  const loadExperimentData = async () => {
    try {
      // Get experiment data from localStorage (set during creation)
      const tempData = localStorage.getItem('temp_experiment');
      if (tempData) {
        const experimentData = JSON.parse(tempData);
        const datasetId = experimentData.datasetId;
        
        // Load the dataset
        const datasetData = await api.getDataset(datasetId);
        setDataset(datasetData);
      }
    } catch (err) {
      console.error('Failed to load experiment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePersona = () => {
    if (!personaName.trim()) return;
    
    const newPersona: Persona = {
      id: Date.now().toString(),
      name: personaName.trim(),
      systemMessage: '',
    };
    
    setPersonas([...personas, newPersona]);
    setEditingPersona(newPersona);
    setSelectedPersonaId(newPersona.id);
    setActiveTab('persona');
    setShowPersonaModal(false);
    setPersonaName('');
  };

  const handleUpdateSystemMessage = (message: string) => {
    if (!editingPersona) return;
    
    const updatedPersona = { ...editingPersona, systemMessage: message };
    setEditingPersona(updatedPersona);
    setPersonas(personas.map(p => p.id === updatedPersona.id ? updatedPersona : p));
  };

  const handleSelectPersona = (personaId: string) => {
    // Check if it's a saved persona from library
    if (personaId.startsWith('saved-')) {
      const savedId = parseInt(personaId.replace('saved-', ''));
      const savedPersona = savedPersonas.find(p => p.id === savedId);
      
      if (savedPersona) {
        // Create a new persona from the saved template
        const newPersona: Persona = {
          id: Date.now().toString(),
          name: savedPersona.name,
          systemMessage: savedPersona.system_message,
        };
        
        setPersonas([...personas, newPersona]);
        setEditingPersona(newPersona);
        setSelectedPersonaId(newPersona.id);
      }
    } else {
      // Regular persona selection
      const persona = personas.find(p => p.id === personaId);
      if (persona) {
        setEditingPersona(persona);
        setSelectedPersonaId(personaId);
      }
    }
  };

  const handleAddBlock = (type: BlockType, column?: 1 | 2) => {
    // Calculate next turn number
    let nextTurn = 1;
    if (conversationBlocks.length > 0) {
      const lastBlock = conversationBlocks.reduce((max, b) => 
        b.turnNumber > max.turnNumber ? b : max
      );
      if (lastBlock.type === 'simulated') {
        nextTurn = lastBlock.turnNumber + (lastBlock.rounds || 1);
      } else {
        nextTurn = lastBlock.turnNumber + 1;
      }
    }

    const newBlock: ConversationBlock = {
      id: Date.now().toString(),
      type,
      column: type === 'simulated' ? 'both' : (column || 1),
      turnNumber: nextTurn,
      content: type === 'predefined' || type === 'initial' ? '' : undefined,
      rounds: type === 'simulated' ? 1 : undefined,
      messageRole: type === 'predefined' || type === 'initial' ? 'user' : undefined,
    };
    
    setConversationBlocks([...conversationBlocks, newBlock]);
    setSelectedBlockId(newBlock.id);
    setActiveTab('conversation');
  };

  const handleSavePersona = () => {
    // Persona is already saved in state via handleUpdateSystemMessage
    // Just show visual feedback
    alert('Persona saved successfully!');
  };

  const handleSaveExperiment = async () => {
    // Validation
    if (!dataset) {
      alert('Please select a dataset');
      return;
    }

    if (personas.length === 0) {
      alert('Please create at least one persona');
      return;
    }

    if (!column1Persona || !column2Persona) {
      alert('Please select personas for both columns');
      return;
    }

    if (!initialMessage) {
      alert('Please enter an initial message');
      return;
    }

    setSaving(true);
    try {
      const config: LLMExperimentConfig = {
        name: editMode ? editingExperimentName : experimentName,
        dataset_id: dataset.id,
        personas: personas,
        conversation_setup: {
          column1_persona_id: column1Persona,
          column2_persona_id: column2Persona,
          first_to_speak: firstToSpeak,
          initial_message: initialMessage,
          initial_message_role: initialMessageRole,
          blocks: conversationBlocks,
        },
      };

      if (editMode && editId) {
        await api.updateExperiment(parseInt(editId), config);
        alert('Experiment updated successfully!');
      } else {
        await api.createLLMExperiment(config);
        alert('Experiment saved successfully!');
      }
      router.push('/dashboard/experiments');
    } catch (err: any) {
      alert(err.message || 'Failed to save experiment');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConversation = () => {
    setShowTestModal(true);
  };

  const handleDeleteBlock = () => {
    if (!selectedBlockId) return;
    setConversationBlocks(conversationBlocks.filter(b => b.id !== selectedBlockId));
    setSelectedBlockId(null);
  };

  const handleUpdateBlock = (updates: Partial<ConversationBlock>) => {
    if (!selectedBlockId) return;
    setConversationBlocks(conversationBlocks.map(b => 
      b.id === selectedBlockId ? { ...b, ...updates } : b
    ));
  };

  const handleDragStart = (block: ConversationBlock) => {
    setDraggedBlock(block);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumn: 1 | 2) => {
    if (!draggedBlock) return;
    
    // Simulated blocks stay as 'both'
    const newColumn = draggedBlock.type === 'simulated' ? 'both' : targetColumn;
    
    setConversationBlocks(conversationBlocks.map(b => 
      b.id === draggedBlock.id ? { ...b, column: newColumn } : b
    ));
    setDraggedBlock(null);
  };

  const getBlocksForColumn = (column: 1 | 2) => {
    return conversationBlocks
      .filter(b => b.column === column)
      .sort((a, b) => a.turnNumber - b.turnNumber);
  };

  const getAllBlocksSorted = () => {
    return [...conversationBlocks].sort((a, b) => a.turnNumber - b.turnNumber);
  };

  const getTurnLabel = (turnNumber: number): string => {
    if (turnNumber === 0) return 'Initialization';
    return `Turn ${turnNumber}`;
  };

  const isColumnOccupiedInTurn = (turn: number, column: 1 | 2): boolean => {
    return conversationBlocks.some(b => 
      b.turnNumber === turn && (b.column === column || b.column === 'both')
    );
  };

  const getNextAvailableTurn = (): number => {
    if (conversationBlocks.length === 0) return 1;
    
    const lastBlock = conversationBlocks.reduce((max, b) => 
      b.turnNumber > max.turnNumber ? b : max
    );
    
    if (lastBlock.type === 'simulated') {
      return lastBlock.turnNumber + (lastBlock.rounds || 1);
    }
    return lastBlock.turnNumber + 1;
  };

  const selectedBlock = selectedBlockId 
    ? conversationBlocks.find(b => b.id === selectedBlockId) 
    : null;

  const renderEditSection = () => {
    switch (activeTab) {
      case 'dataset':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 mb-4">Dataset Information</h3>
            {dataset ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Name</label>
                  <p className="text-sm text-zinc-900">{dataset.name}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Size</label>
                  <p className="text-sm text-zinc-900">{dataset.row_count} rows</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">Variables</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {dataset.column_names.map((col) => (
                      <span
                        key={col}
                        className="px-2 py-1 bg-zinc-100 border border-zinc-200 rounded text-xs text-zinc-700"
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-zinc-500">No dataset loaded</p>
            )}
          </div>
        );
      
      case 'persona':
        return (
          <div className="space-y-4">
            {/* Persona Selector and Create Button */}
            <div className="flex items-center gap-2 mb-4">
              <select
                value={selectedPersonaId || ''}
                onChange={(e) => e.target.value && handleSelectPersona(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
              >
                <option value="">
                  {personas.length === 0 && savedPersonas.length === 0 ? 'No persona available' : 'Select persona...'}
                </option>
                
                {/* Current Personas */}
                {personas.length > 0 && (
                  <optgroup label="Current Personas">
                    {personas.map((persona) => (
                      <option key={persona.id} value={persona.id}>
                        {persona.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Saved Personas from Library */}
                {savedPersonas.length > 0 && (
                  <optgroup label="Saved Personas Library">
                    {savedPersonas.map((persona) => (
                      <option key={`saved-${persona.id}`} value={`saved-${persona.id}`}>
                        {persona.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                onClick={() => setShowPersonaModal(true)}
                className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors whitespace-nowrap"
              >
                Create
              </button>
            </div>

            {/* Grayed out section when no persona selected */}
            {!editingPersona && (
              <div className="relative">
                <div className="absolute inset-0 bg-zinc-100/80 z-10 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-zinc-500">Select or create a persona to edit</p>
                </div>
                <div className="opacity-30 pointer-events-none">
                  <label className="block text-xs font-medium text-zinc-600 mb-2">
                    System Message
                  </label>
                  <textarea
                    disabled
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg resize-none"
                    rows={8}
                  />
                </div>
              </div>
            )}

            {/* System Message Editor - Only shown when persona selected */}
            {editingPersona && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-2">
                    System Message
                  </label>
                  <textarea
                    value={editingPersona.systemMessage}
                    onChange={(e) => handleUpdateSystemMessage(e.target.value)}
                    placeholder="Enter system message for this persona..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 resize-none"
                    rows={12}
                  />
                </div>
                <button
                  onClick={handleSavePersona}
                  className="w-full px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        );
      
      case 'conversation':
        if (!selectedBlockId || selectedBlockId === 'initial') {
          // Editing initialization block
          return (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Initialization Block</h3>
              
              {/* First to Speak Slider */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-3">First to Speak</label>
                <div className="flex items-center gap-4">
                  <span className={`text-xs ${firstToSpeak === 1 ? 'font-semibold text-zinc-900' : 'text-zinc-500'}`}>
                    Column 1
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="range"
                      min="1"
                      max="2"
                      value={firstToSpeak}
                      onChange={(e) => setFirstToSpeak(Number(e.target.value) as 1 | 2)}
                      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: firstToSpeak === 1 
                          ? 'linear-gradient(to right, #18181b 0%, #18181b 50%, #e4e4e7 50%, #e4e4e7 100%)'
                          : 'linear-gradient(to right, #e4e4e7 0%, #e4e4e7 50%, #18181b 50%, #18181b 100%)'
                      }}
                    />
                  </div>
                  <span className={`text-xs ${firstToSpeak === 2 ? 'font-semibold text-zinc-900' : 'text-zinc-500'}`}>
                    Column 2
                  </span>
                </div>
              </div>

              {/* Message Role Slider */}
              <div className="pt-4">
                <label className="block text-xs font-medium text-zinc-600 mb-3">Message Role</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setInitialMessageRole('system')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                      initialMessageRole === 'system'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    System
                  </button>
                  <button
                    onClick={() => setInitialMessageRole('assistant')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                      initialMessageRole === 'assistant'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    Assistant
                  </button>
                  <button
                    onClick={() => setInitialMessageRole('user')}
                    className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                      initialMessageRole === 'user'
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    User
                  </button>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-2">
                  Message
                </label>
                <textarea
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  placeholder="Enter the first message to start the conversation..."
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 resize-none"
                  rows={6}
                />
              </div>

              <button
                onClick={() => {/* Already saved in state */}}
                className="w-full px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Save
              </button>
            </div>
          );
        }

        // Selected block editing
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-zinc-900">
                {selectedBlock?.type === 'predefined' ? 'Pre-defined Response' : 'Simulated Turns'}
              </h3>
              <button
                onClick={handleDeleteBlock}
                className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                title="Delete Block"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {selectedBlock?.type === 'predefined' ? (
              <>
                {/* Message Role Slider */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-3">Message Role</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateBlock({ messageRole: 'system' })}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                        selectedBlock.messageRole === 'system'
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      System
                    </button>
                    <button
                      onClick={() => handleUpdateBlock({ messageRole: 'assistant' })}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                        selectedBlock.messageRole === 'assistant'
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      Assistant
                    </button>
                    <button
                      onClick={() => handleUpdateBlock({ messageRole: 'user' })}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border transition-colors ${
                        selectedBlock.messageRole === 'user'
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      User
                    </button>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-zinc-600 mb-2">
                    Message
                  </label>
                  <textarea
                    value={selectedBlock.content || ''}
                    onChange={(e) => handleUpdateBlock({ content: e.target.value })}
                    placeholder="Enter the pre-defined response..."
                    className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 resize-none"
                    rows={8}
                  />
                </div>

                <button
                  onClick={() => {/* Already saved in state */}}
                  className="w-full px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  Save
                </button>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-2">
                  How many turns to simulate
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={selectedBlock?.rounds || 1}
                  onChange={(e) => handleUpdateBlock({ rounds: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                />
                <p className="mt-2 text-xs text-zinc-500">
                  The LLMs will exchange messages for this many turns.
                </p>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderConversationSection = () => {
    const column1Blocks = getBlocksForColumn(1);
    const column2Blocks = getBlocksForColumn(2);
    const column1PersonaObj = personas.find(p => p.id === column1Persona);
    const column2PersonaObj = personas.find(p => p.id === column2Persona);
    const allBlocks = getAllBlocksSorted();
    const nextTurn = getNextAvailableTurn();

    const renderBlock = (block: ConversationBlock, isFullWidth = false) => (
      <div
        key={block.id}
        draggable
        onDragStart={() => handleDragStart(block)}
        onClick={() => setSelectedBlockId(block.id)}
        className={`bg-white border-2 rounded-lg p-3 cursor-pointer transition-all ${
          selectedBlockId === block.id
            ? 'border-zinc-900 shadow-md'
            : 'border-zinc-200 hover:border-zinc-400'
        } ${isFullWidth ? 'col-span-2' : ''}`}
      >
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 text-zinc-400 flex-shrink-0 cursor-grab" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {block.type === 'predefined' ? (
                <span className="text-xs font-medium text-blue-600">Pre-defined Response</span>
              ) : (
                <span className="text-xs font-medium text-purple-600">Simulated Turns</span>
              )}
            </div>
            {block.type === 'predefined' ? (
              <p className="text-sm text-zinc-700 line-clamp-2">
                {block.content || 'Empty response...'}
              </p>
            ) : (
              <p className="text-sm text-zinc-500">
                {block.rounds} turn{block.rounds !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      </div>
    );

    const renderAddBlockButtons = () => (
      <div className="col-span-2 grid grid-cols-2 gap-8 py-4">
        {/* Pre-defined button for Column 1 */}
        <div className="flex justify-center">
          <button
            onClick={() => handleAddBlock('predefined', 1)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            title="Add Pre-defined Response to Column 1"
          >
            <Plus className="h-4 w-4" />
            Pre-defined
          </button>
        </div>

        {/* Pre-defined button for Column 2 */}
        <div className="flex justify-center">
          <button
            onClick={() => handleAddBlock('predefined', 2)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            title="Add Pre-defined Response to Column 2"
          >
            <Plus className="h-4 w-4" />
            Pre-defined
          </button>
        </div>

        {/* Simulate Turns button in the middle - spans both columns */}
        <div className="col-span-2 flex justify-center -mt-2">
          <button
            onClick={() => handleAddBlock('simulated')}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-purple-600 border border-purple-200 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            title="Add Simulated Turns"
          >
            <Plus className="h-4 w-4" />
            Simulate Turns
          </button>
        </div>
      </div>
    );

    const renderTurnSeparator = (turn: number) => (
      <div className="col-span-2 relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-zinc-300"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium text-zinc-500">
            {getTurnLabel(turn)}
          </span>
        </div>
      </div>
    );

    return (
      <div className="h-full bg-white overflow-y-auto">
        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Column 1 Header */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(1)}
            >
              <label className="block text-xs font-medium text-zinc-600 mb-2">Persona</label>
              <select
                value={column1Persona}
                onChange={(e) => setColumn1Persona(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
              >
                <option value="">Persona...</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
              
              {column1PersonaObj && column1PersonaObj.systemMessage && (
                <p className="mt-2 text-xs text-zinc-500">
                  System message: {column1PersonaObj.systemMessage.substring(0, 50)}
                  {column1PersonaObj.systemMessage.length > 50 ? '...' : ''}
                </p>
              )}
            </div>

            {/* Column 2 Header */}
            <div
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(2)}
            >
              <label className="block text-xs font-medium text-zinc-600 mb-2">Persona</label>
              <select
                value={column2Persona}
                onChange={(e) => setColumn2Persona(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
              >
                <option value="">Persona...</option>
                {personas.map((persona) => (
                  <option key={persona.id} value={persona.id}>
                    {persona.name}
                  </option>
                ))}
              </select>
              
              {column2PersonaObj && column2PersonaObj.systemMessage && (
                <p className="mt-2 text-xs text-zinc-500">
                  System message: {column2PersonaObj.systemMessage.substring(0, 50)}
                  {column2PersonaObj.systemMessage.length > 50 ? '...' : ''}
                </p>
              )}
            </div>

            {/* Initialization Separator */}
            {initialMessage && renderTurnSeparator(0)}

            {/* Initial Message Block */}
            {firstToSpeak === 1 && initialMessage && (
              <>
                <div
                  onClick={() => setSelectedBlockId('initial')}
                  className={`bg-zinc-50 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBlockId === 'initial'
                      ? 'border-zinc-900 shadow-md'
                      : 'border-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-zinc-500 mt-0.5" />
                    <span className="text-xs font-medium text-zinc-600">Initial Message</span>
                  </div>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{initialMessage}</p>
                </div>
                <div></div>
              </>
            )}
            {firstToSpeak === 2 && initialMessage && (
              <>
                <div></div>
                <div
                  onClick={() => setSelectedBlockId('initial')}
                  className={`bg-zinc-50 border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedBlockId === 'initial'
                      ? 'border-zinc-900 shadow-md'
                      : 'border-zinc-300 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-zinc-500 mt-0.5" />
                    <span className="text-xs font-medium text-zinc-600">Initial Message</span>
                  </div>
                  <p className="text-sm text-zinc-700 whitespace-pre-wrap">{initialMessage}</p>
                </div>
              </>
            )}

            {/* Render all blocks with turn separators */}
            {allBlocks.map((block, index) => {
              const isFirstBlockOfTurn = index === 0 || allBlocks[index - 1].turnNumber !== block.turnNumber;
              const isSimulated = block.type === 'simulated';
              
              return (
                <React.Fragment key={block.id}>
                  {/* Turn separator */}
                  {isFirstBlockOfTurn && renderTurnSeparator(block.turnNumber)}
                  
                  {/* Simulated blocks span both columns */}
                  {isSimulated ? (
                    renderBlock(block, true)
                  ) : (
                    <>
                      {block.column === 1 && (
                        <>
                          {renderBlock(block)}
                          <div></div>
                        </>
                      )}
                      {block.column === 2 && (
                        <>
                          <div></div>
                          {renderBlock(block)}
                        </>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            })}

            {/* Add Block Buttons - only show if initial message exists */}
            {initialMessage && (
              <>
                {renderTurnSeparator(nextTurn)}
                {renderAddBlockButtons()}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
            <p className="mt-4 text-sm text-zinc-600">Loading...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        {/* Persona Name Modal */}
        {showPersonaModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Create Persona</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">
                    Persona Name
                  </label>
                  <input
                    type="text"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreatePersona()}
                    placeholder="e.g., Customer Support Agent"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                    autoFocus
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowPersonaModal(false);
                    setPersonaName('');
                  }}
                  className="px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePersona}
                  disabled={!personaName.trim()}
                  className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="bg-white border-b border-zinc-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard/experiments/create')}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-zinc-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-zinc-900">
                  {editMode ? editingExperimentName : experimentName}
                </h1>
                {editMode && (
                  <p className="text-sm text-zinc-500">Editing experiment</p>
                )}
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestConversation}
                className="px-4 py-2 text-sm text-zinc-700 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors flex items-center gap-2"
              >
                <Play size={16} />
                Test conversation
              </button>
              <button
                onClick={handleSaveExperiment}
                disabled={saving}
                className="px-4 py-2 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - Edit Section (1/3) */}
          <div className="w-1/3 border-r border-zinc-200 bg-white flex flex-col">
            {/* Tabs */}
            <div className="border-b border-zinc-200 flex">
              <button
                onClick={() => setActiveTab('dataset')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'dataset'
                    ? 'bg-zinc-50 text-zinc-900 border-b-2 border-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <Database className="h-4 w-4" />
                Dataset
              </button>
              <button
                onClick={() => setActiveTab('persona')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'persona'
                    ? 'bg-zinc-50 text-zinc-900 border-b-2 border-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <User className="h-4 w-4" />
                Persona
              </button>
              <button
                onClick={() => setActiveTab('conversation')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === 'conversation'
                    ? 'bg-zinc-50 text-zinc-900 border-b-2 border-zinc-900'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Conversation Setup
              </button>
            </div>

            {/* Edit Section Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderEditSection()}
            </div>
          </div>

          {/* Right Side - Conversation Section (2/3) */}
          <div className="w-2/3 overflow-y-auto">
            {renderConversationSection()}
          </div>
        </div>

        {/* Test Conversation Modal */}
        {showTestModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-zinc-200 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-semibold text-zinc-900">Test Conversation Preview</h2>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-zinc-500 hover:text-zinc-700 text-2xl leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  {/* Initial Message */}
                  {initialMessage && (
                    <div className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
                      <div className="text-sm text-zinc-600 mb-1 font-medium">
                        Initial Message ({initialMessageRole})
                      </div>
                      <div className="text-zinc-900">{initialMessage}</div>
                    </div>
                  )}

                  {/* Conversation Blocks by Turn */}
                  {Array.from(new Set(conversationBlocks.map(b => b.turnNumber))).sort((a, b) => a - b).map(turnNum => {
                    const turnBlocks = conversationBlocks.filter(b => b.turnNumber === turnNum).sort((a, b) => {
                      if (a.column === 'both') return 0;
                      if (b.column === 'both') return 0;
                      return a.column - b.column;
                    });
                    
                    return (
                      <div key={turnNum} className="border border-zinc-200 rounded-lg p-4 bg-zinc-50">
                        <div className="font-semibold mb-3 text-zinc-700">{getTurnLabel(turnNum)}</div>
                        <div className="space-y-3">
                          {turnBlocks.map((block) => (
                            <div key={block.id} className="bg-white rounded p-3">
                              {block.type === 'predefined' ? (
                                <div className="border-l-4 border-green-500 pl-3">
                                  <div className="text-sm text-zinc-600 mb-1 font-medium">
                                    {block.column === 1 
                                      ? personas.find(p => p.id === column1Persona)?.name || 'Persona 1'
                                      : personas.find(p => p.id === column2Persona)?.name || 'Persona 2'
                                    } (Pre-defined Response)
                                  </div>
                                  <div className="text-zinc-800">{block.content || '(No content)'}</div>
                                </div>
                              ) : (
                                <div className="border-l-4 border-purple-500 pl-3 py-2 bg-purple-50">
                                  <div className="text-sm text-zinc-600 mb-1 font-medium">
                                    Simulated Turns
                                  </div>
                                  <div className="text-xs text-zinc-500">
                                    AI will generate {block.rounds || 1} turn{(block.rounds || 1) > 1 ? 's' : ''} of conversation
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {conversationBlocks.length === 0 && !initialMessage && (
                    <div className="text-center py-12 text-zinc-500">
                      No conversation setup yet. Start by adding an initial message in the Conversation Setup tab.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-zinc-200 flex justify-end flex-shrink-0">
                <button
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function LLMLLMSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 mx-auto"></div>
          <p className="mt-4 text-sm text-zinc-600">Loading...</p>
        </div>
      </div>
    }>
      <LLMLLMSetupContent />
    </Suspense>
  );
}
