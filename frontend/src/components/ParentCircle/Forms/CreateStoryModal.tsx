/**
 * ============================================
 * CREATE STORY MODAL
 * ============================================
 * @version     1.0.0
 * @author      ArogoClin
 * @updated     2025-11-23 07:04:02 UTC
 * ============================================
 */

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Category } from '../../../types/parentcircle.types';
import * as API from '../../../services/parentcircle.service';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: 0,
    tags: '',
    isAnonymous: false,
    authorName: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories for stories
  const storyCategories = categories.filter(
    cat => cat.type === 'STORY' || cat.type === 'BOTH'
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim() || formData.content.trim().length < 50) {
      newErrors.content = 'Story must be at least 50 characters';
    }

    if (formData.isAnonymous && !formData.authorName.trim()) {
      newErrors.authorName = 'Please provide a display name for anonymous posting';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...(formData.title.trim() && { title: formData.title.trim() }),
        content: formData.content.trim(),
        ...(formData.categoryId && { categoryId: formData.categoryId }),
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && 
          formData.authorName.trim() && 
          { authorName: formData.authorName.trim() })
      };

      await API.createStory(payload);

      toast.success(
        '✅ Story submitted! It will appear after moderation.',
        { duration: 5000 }
      );

      // Reset form
      setFormData({
        title: '',
        content: '',
        categoryId: 0,
        tags: '',
        isAnonymous: false,
        authorName: ''
      });
      setErrors({});

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        title: '',
        content: '',
        categoryId: 0,
        tags: '',
        isAnonymous: false,
        authorName: ''
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-teal p-6 text-white">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-2xl font-bold flex items-center gap-2">
                      <span>📖</span>
                      Share Your Story
                    </Dialog.Title>
                    <button
                      onClick={handleClose}
                      disabled={submitting}
                      className="text-white hover:text-gray-200 transition-colors disabled:opacity-50"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-white/90">
                    Inspire others with your journey and experiences
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Category Selection (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category (Optional)
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none transition-all"
                    >
                      <option value={0}>General / Uncategorized</option>
                      {storyCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Story Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., How I overcame postpartum depression"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none transition-all"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.title.length}/200 characters
                    </p>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Your Story <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Share your journey, what you learned, and how it might help others. Be authentic and speak from the heart..."
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.content ? 'border-red-500' : 'border-gray-200'
                      } focus:border-teal focus:outline-none transition-all min-h-[200px] resize-none`}
                      required
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.content.length} characters (minimum 50)
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tags (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., hope, recovery, resilience (comma-separated)"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal focus:outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate tags with commas
                    </p>
                  </div>

                  {/* Anonymous Option */}
                  <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="w-5 h-5 rounded text-teal focus:ring-teal"
                      />
                      <div>
                        <span className="text-sm font-bold text-gray-900">
                          Post anonymously
                        </span>
                        <p className="text-xs text-gray-600">
                          Share your story without revealing your identity
                        </p>
                      </div>
                    </label>

                    {formData.isAnonymous && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <input
                          type="text"
                          value={formData.authorName}
                          onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                          placeholder="Display name (e.g., Hopeful Parent)"
                          className={`w-full px-4 py-2 rounded-lg border-2 ${
                            errors.authorName ? 'border-red-500' : 'border-gray-200'
                          } focus:border-teal focus:outline-none transition-all text-sm`}
                          maxLength={50}
                        />
                        {errors.authorName && (
                          <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>
                        )}
                      </motion.div>
                    )}
                  </div>

                  {/* Guidelines */}
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <h4 className="font-bold text-sm text-green-900 mb-2">
                      💚 Story Guidelines
                    </h4>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• Share authentic experiences and emotions</li>
                      <li>• Focus on hope, growth, and lessons learned</li>
                      <li>• Be respectful and supportive of others</li>
                      <li>• All stories are reviewed before posting</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-teal text-white font-bold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Sharing...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5" />
                          <span>Share Story</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CreateStoryModal;