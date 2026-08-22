'use client';

import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { submitFeedbackUnsafe } from '@/app/actions/SubmitFeedbackAction';
import { Card, CardHeader, CardTitle } from '../ui/card';
import { ibmPlexMono } from '@/lib/font';
import { toast } from 'sonner';
import { DialogClose } from '../ui/dialog';

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export default function FeedbackForm() {
  const [telegram, setTelegram] = useState('');
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const cleanTelegram = telegram.replace(/^@+/, '').trim();
      await submitFeedbackUnsafe(cleanTelegram, comments);
      toast('Thank you for your feedback!');
      setTelegram('');
      setComments('');
    } catch {
      toast('Something went wrong, please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const disabled = isLoading || !telegram.trim() || !comments.trim();

  return (
    <Card className="bg-[#1A1A1A] border-2 border-black rounded-none w-full md:w-fit md:min-w-[600px] mx-auto my-6 py-6">
      <CardHeader>
        <CardTitle
          className={`text-coffee text-xl font-normal text-center mx-auto ${ibmPlexMono.className}`}
        >
          FEEDBACK
        </CardTitle>
      </CardHeader>

      {/* unified white outline around fields */}
      <div className=" rounded-md p-4 mx-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Telegram Fieldset */}
          <div className='space-y-6 border border-[#D1D1D1] rounded-sm p-2'>

            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <div className="overflow-hidden rounded-sm border border-gray-600">
                <div className="bg-[#757575] text-[#E4E4E4] text-sm font-mono px-2 py-1 uppercase">
                  TELEGRAM HANDLE
                </div>
                <input
                  type="text"
                  placeholder="------"
                  value={telegram}
                  onChange={e => setTelegram(e.target.value)}
                  className="w-full bg-black text-gray-100 placeholder-gray-600 font-mono px-2 py-2 focus:outline-none"
                />
              </div>
            </motion.div>

            {/* Comments Fieldset */}
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
              <div className="overflow-hidden rounded-sm border border-gray-600">
                <div className="bg-[#757575] text-[#E4E4E4] text-sm font-mono px-2 py-1 uppercase">
                  COMMENTS
                </div>
                <textarea
                  placeholder="------"
                  rows={4}
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full bg-black text-gray-100 placeholder-gray-600 font-mono px-2 py-2 resize-none focus:outline-none"
                />
              </div>
            </motion.div>
          </div>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <Button
              type="submit"
              disabled={disabled}
              className={`bg-[#448D7A] text-white ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
            >
              SUBMIT
              {isLoading && (
                <div className="absolute bottom-0 left-0 right-0 mb-1 h-1 flex justify-center">
                  <div className="loader"></div>
                </div>
              )}
            </Button>
            <DialogClose asChild>
              <Button className="bg-[#575757] border-[#7B7B7B] text-white">CANCEL</Button>
            </DialogClose>
          </div>
        </form>
      </div>
    </Card>
  );
}
