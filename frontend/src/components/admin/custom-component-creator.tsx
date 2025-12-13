"use client"

import { useState } from 'react'
import { 
  PlusIcon, 
  TrashIcon,
  CodeBracketIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface CustomComponent {
  id: string
  name: string
  description: string
  category: string
  html: string
  css: string
  js: string
  props: ComponentProp[]
}

interface ComponentProp {
  name: string
  type: 'string' | 'number' | 'boolean' | 'array' | 'object'
  label: string
  description: string
  required: boolean
  defaultValue?: string | number | boolean
}

export function CustomComponentCreator() {
  const [component, setComponent] = useState<CustomComponent>({
    id: '',
    name: '',
    description: '',
    category: 'custom',
    html: '',
    css: '',
    js: '',
    props: []
  })

  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const addProp = () => {
    setComponent(prev => ({
      ...prev,
      props: [...prev.props, {
        name: '',
        type: 'string',
        label: '',
        description: '',
        required: false,
        defaultValue: ''
      }]
    }))
  }

  const removeProp = (index: number) => {
    setComponent(prev => ({
      ...prev,
      props: prev.props.filter((_, i) => i !== index)
    }))
  }

  const updateProp = (index: number, field: keyof ComponentProp, value: any) => {
    setComponent(prev => ({
      ...prev,
      props: prev.props.map((prop, i) => 
        i === index ? { ...prop, [field]: value } : prop
      )
    }))
  }

  const handleSave = async () => {
    if (!component.name.trim()) {
      alert('Component name is required')
      return
    }

    if (!component.html.trim()) {
      alert('HTML template is required')
      return
    }

    setIsSaving(true)
    try {
      // TODO: Implement API call to save custom component
      console.log('Saving custom component:', component)
      alert('Custom component saved successfully!')
    } catch (error) {
      console.error('Failed to save custom component:', error)
      alert('Failed to save custom component')
    } finally {
      setIsSaving(false)
    }
  }

  const generatePreview = () => {
    // Generate a preview of the component with sample data
    const sampleProps = component.props.reduce((acc, prop) => {
      acc[prop.name] = prop.defaultValue || getDefaultValue(prop.type)
      return acc
    }, {} as Record<string, any>)

    return `
      <style>${component.css}</style>
      <div id="component-preview">
        ${component.html.replace(/\{\{(\w+)\}\}/g, (match, propName) => {
          return sampleProps[propName] || match
        })}
      </div>
      <script>${component.js}</script>
    `
  }

  const getDefaultValue = (type: string) => {
    switch (type) {
      case 'string': return 'Sample Text'
      case 'number': return 42
      case 'boolean': return true
      case 'array': return '[]'
      case 'object': return '{}'
      default: return ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Component Information
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Component Name *
            </label>
            <input
              type="text"
              value={component.name}
              onChange={(e) => setComponent(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="my-custom-component"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              value={component.category}
              onChange={(e) => setComponent(prev => ({ ...prev, category: e.target.value }))}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="custom">Custom</option>
              <option value="layout">Layout</option>
              <option value="content">Content</option>
              <option value="interactive">Interactive</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={component.description}
              onChange={(e) => setComponent(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe what this component does..."
            />
          </div>
        </div>
      </div>

      {/* Component Properties */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Component Properties
          </h2>
          <button
            onClick={addProp}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-400 dark:bg-indigo-900 dark:hover:bg-indigo-800"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Property
          </button>
        </div>

        {component.props.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No properties defined. Add properties to make your component configurable.
          </p>
        ) : (
          <div className="space-y-4">
            {component.props.map((prop, index) => (
              <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Property {index + 1}
                  </h3>
                  <button
                    onClick={() => removeProp(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Property Name
                    </label>
                    <input
                      type="text"
                      value={prop.name}
                      onChange={(e) => updateProp(index, 'name', e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                      placeholder="title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      value={prop.type}
                      onChange={(e) => updateProp(index, 'type', e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Label
                    </label>
                    <input
                      type="text"
                      value={prop.label}
                      onChange={(e) => updateProp(index, 'label', e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                      placeholder="Title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Default Value
                    </label>
                    <input
                      type="text"
                      value={prop.defaultValue || ''}
                      onChange={(e) => updateProp(index, 'defaultValue', e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                      placeholder="Default value"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <input
                      type="text"
                      value={prop.description}
                      onChange={(e) => updateProp(index, 'description', e.target.value)}
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                      placeholder="Property description"
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={prop.required}
                        onChange={(e) => updateProp(index, 'required', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">Required</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Component Code */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Component Code
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HTML Template
            </label>
            <textarea
              value={component.html}
              onChange={(e) => setComponent(prev => ({ ...prev, html: e.target.value }))}
              rows={8}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder="<div class='my-component'>{{title}}</div>"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Use {{propertyName}} to reference component properties
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              CSS Styles
            </label>
            <textarea
              value={component.css}
              onChange={(e) => setComponent(prev => ({ ...prev, css: e.target.value }))}
              rows={6}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder=".my-component { color: #333; }"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              JavaScript (Optional)
            </label>
            <textarea
              value={component.js}
              onChange={(e) => setComponent(prev => ({ ...prev, js: e.target.value }))}
              rows={6}
              className="block w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
              placeholder="// Add any JavaScript functionality here"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Preview
          </h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>

        {showPreview && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div 
              className="preview-container"
              dangerouslySetInnerHTML={{ __html: generatePreview() }}
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CodeBracketIcon className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Component'}
        </button>
      </div>
    </div>
  )
} 