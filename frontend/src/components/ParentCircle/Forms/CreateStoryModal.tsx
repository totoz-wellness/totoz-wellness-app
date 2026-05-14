/**
 * ============================================
 * CREATE STORY MODAL — PARENTCIRCLE
 * ============================================
 * @version     3.0.0
 * @updated     2025-04-23
 * @description Headless UI Dialog version with brand styling
 * ============================================
 */

import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
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

// ─── SHARED FIELD STYLES ─────────────────────────────────────────────────────

const fieldClass = (hasError?: boolean) =>
  `w-full px-4 py-3 bg-[#fbfbfb] border rounded-xl text-[#1e3a6e] placeholder-[#1e3a6e]/30 text-sm focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
      : 'border-[#1e3a6e]/12 focus:border-[#e9924b]/50 focus:ring-[#e9924b]/8'
  }`;

const labelClass = 'block text-xs font-semibold text-[#1e3a6e]/60 mb-2';

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen, onClose, categories, onSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: 0,
    tags: '',
    isAnonymous: true,
    authorName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const storyCategories = categories.filter(c => c.type === 'STORY' || c.type === 'BOTH');

  const set = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.content.trim() || formData.content.trim().length < 50)
      e.content = 'Please write at least 50 characters';
    if (formData.isAnonymous && !formData.authorName.trim())
      e.authorName = 'Please provide a display name';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors above'); return; }
    try {
      setSubmitting(true);
      await API.createStory({
        ...(formData.title.trim() && { title: formData.title.trim() }),
        content: formData.content.trim(),
        ...(formData.categoryId && { categoryId: formData.categoryId }),
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        isAnonymous: formData.isAnonymous,
        ...(formData.isAnonymous && formData.authorName.trim() && { authorName: formData.authorName.trim() }),
      });
      toast.success('Your story has been submitted for review. Thank you for sharing.');
      reset();
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit story');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFormData({ title: '', content: '', categoryId: 0, tags: '', isAnonymous: true, authorName: '' });
    setErrors({});
  };

  const handleClose = () => { if (!submitting) { reset(); onClose(); } };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>

        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#1e3a6e]/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="px-6 py-5 border-b border-[#1e3a6e]/8">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title className="font-heading font-extrabold text-[#1e3a6e] text-lg">
                        Share your story
                      </Dialog.Title>
                      <p className="text-[#1e3a6e]/40 text-xs mt-0.5">Your experience might be exactly what another parent needs.</p>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={submitting}
                      className="p-1.5 text-[#1e3a6e]/40 hover:text-[#1e3a6e] hover:bg-[#1e3a6e]/5 rounded-xl transition-all disabled:opacity-30"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form body */}
                <form onSubmit={handleSubmit}>
                  <div className="px-6 py-5 space-y-5 max-h-[calc(100vh-220px)] overflow-y-auto">

                    {/* Category */}
                    <div>
                      <label className={labelClass}>
                        Category <span className="text-[#1e3a6e]/30 font-normal">(optional)</span>
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={e => set('categoryId', parseInt(e.target.value))}
                        className={fieldClass()}
                      >
                        <option value={0}>General / uncategorized</option>
                        {storyCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Title */}
                    <div>
                      <label className={labelClass}>
                        Title <span className="text-[#1e3a6e]/30 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => set('title', e.target.value)}
                        placeholder="Give your story a title..."
                        className={fieldClass()}
                        maxLength={200}
                      />
                      <p className="text-[#1e3a6e]/25 text-xs mt-1 text-right">{formData.title.length}/200</p>
                    </div>

                    {/* Content */}
                    <div>
                      <label className={labelClass}>
                        Your story <span className="text-[#e9924b]">*</span>
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={e => set('content', e.target.value)}
                        placeholder="Write as much or as little as feels right. Share your journey, what you learned, and how it might help others..."
                        className={`${fieldClass(!!errors.content)} min-h-[170px] resize-none leading-[1.85]`}
                        required
                      />
                      {errors.content && <p className="text-red-500 text-xs mt-1.5">{errors.content}</p>}
                      <p className="text-[#1e3a6e]/25 text-xs mt-1 text-right">{formData.content.length} characters (min. 50)</p>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className={labelClass}>
                        Tags <span className="text-[#1e3a6e]/30 font-normal">(comma separated)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={e => set('tags', e.target.value)}
                        placeholder="hope, recovery, resilience"
                        className={fieldClass()}
                      />
                    </div>

                    {/* Anonymity */}
                    <div className="rounded-xl border border-[#1e3a6e]/8 bg-[#fbfbfb] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[#1e3a6e] text-sm">Post anonymously</p>
                          <p className="text-[#1e3a6e]/40 text-xs mt-0.5">Share your story without revealing your identity</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => set('isAnonymous', !formData.isAnonymous)}
                          className="relative rounded-full transition-colors flex-shrink-0"
                          style={{ height: '22px', width: '40px', backgroundColor: formData.isAnonymous ? '#e9924b' : 'rgba(30,58,110,0.15)' }}
                        >
                          <span
                            className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform"
                            style={{ transform: formData.isAnonymous ? 'translateX(18px)' : 'translateX(0)' }}
                          />
                        </button>
                      </div>

                      {formData.isAnonymous && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3"
                        >
                          <input
                            type="text"
                            value={formData.authorName}
                            onChange={e => set('authorName', e.target.value)}
                            placeholder="Display name (e.g., Hopeful Parent)"
                            className={fieldClass(!!errors.authorName)}
                            maxLength={50}
                          />
                          {errors.authorName && <p className="text-red-500 text-xs mt-1.5">{errors.authorName}</p>}
                        </motion.div>
                      )}
                    </div>

                    {/* Guidelines */}
                    <div className="rounded-xl border border-[#659ec3]/15 bg-[#659ec3]/5 p-4">
                      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[#659ec3] mb-3">Story guidelines</p>
                      <ul className="space-y-2">
                        {[
                          'Share authentic experiences and emotions',
                          'Focus on what you learned and how it might help others',
                          'Be respectful and supportive of the community',
                          'All stories are reviewed before appearing',
                        ].map((g, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-[#1e3a6e]/60 leading-relaxed">
                            <span className="w-1 h-1 rounded-full bg-[#659ec3] flex-shrink-0 mt-1.5" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 border-t border-[#1e3a6e]/8 flex gap-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 border border-[#1e3a6e]/20 text-[#1e3a6e]/60 text-sm font-semibold rounded-xl hover:bg-[#1e3a6e]/5 transition-all disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-4 py-2.5 bg-[#e9924b] hover:bg-[#d4762a] text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-[#e9924b]/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Sharing...
                        </>
                      ) : (
                        'Share story'
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