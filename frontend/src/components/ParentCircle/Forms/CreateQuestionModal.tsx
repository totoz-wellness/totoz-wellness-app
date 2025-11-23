/**
 * ============================================
 * CREATE QUESTION MODAL
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

interface CreateQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

const CreateQuestionModal: React.FC<CreateQuestionModalProps> = ({
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

  // Filter categories for questions
  const questionCategories = categories.filter(
    cat => cat.type === 'QUESTION' || cat.type === 'BOTH'
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.content.trim() || formData.content.trim().length < 20) {
      newErrors.content = 'Question must be at least 20 characters';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
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
        categoryId: formData.categoryId,
        tags: formData.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(Boolean),
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && 
          formData.authorName.trim() && 
          { authorName: formData.authorName.trim() })
      };

      await API.createQuestion(payload);

      toast.success(
        '✅ Question submitted! It will appear after moderation.',
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
      toast.error(error.message || 'Failed to submit question');
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
                <div className="bg-gradient-to-r from-teal to-blue-500 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-2xl font-bold flex items-center gap-2">
                      <span>🙋</span>
                      Ask the Community
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
                    Share your question with our supportive community
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.categoryId ? 'border-red-500' : 'border-gray-200'
                      } focus:border-teal focus:outline-none transition-all`}
                      required
                    >
                      <option value={0}>Select a category...</option>
                      {questionCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>
                    )}
                  </div>

                  {/* Title (Optional) */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Title (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., My toddler won't sleep through the night"
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
                      Your Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Describe your situation in detail. What have you tried? What specific help are you looking for?"
                      className={`w-full px-4 py-3 rounded-xl border-2 ${
                        errors.content ? 'border-red-500' : 'border-gray-200'
                      } focus:border-teal focus:outline-none transition-all min-h-[150px] resize-none`}
                      required
                    />
                    {errors.content && (
                      <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.content.length} characters (minimum 20)
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
                      placeholder="e.g., sleep, toddler, nighttime (comma-separated)"
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
                          Your identity will be hidden from the community
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
                          placeholder="Display name (e.g., Concerned Parent)"
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
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <h4 className="font-bold text-sm text-blue-900 mb-2">
                      📌 Posting Guidelines
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Be specific about your situation</li>
                      <li>• Mention what you've already tried</li>
                      <li>• Be respectful and kind to all members</li>
                      <li>• All questions are reviewed before posting</li>
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
                      className="flex-1 px-6 py-3 rounded-xl bg-teal text-white font-bold hover:bg-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="w-5 h-5" />
                          <span>Post Question</span>
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

export default CreateQuestionModal;